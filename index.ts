import type { SetStateAction } from 'react';
import { useState, useRef, useEffect } from 'react';

export type GlobalStateSetter<State> = (state: SetStateAction<State>) => void;
export type GlobalStateHook<State> = () => readonly [State, GlobalStateSetter<State>];
export type GlobalStateGetter<State> = () => State;
export type GlobalState<State> = readonly [GlobalStateHook<State>, GlobalStateSetter<State>, GlobalStateGetter<State>];

type UpdateState = (() => void) & {
	/** The index of this function in `updateStates`. */
	_index: number
};

/**
 * Creates a [global React state](https://github.com/GrantGryczan/global-react-state#global-react-state).
 *
 * Usage:
 * ```
 * const [useMyState, setMyState, getMyState] = createGlobalState(initialValue);
 * ```
 *
 * Hook usage:
 * ```
 * const [myState, setMyState] = useMyState();
 * ```
 *
 * Setter usage:
 * ```
 * setMyState(newValue);
 * ```
 *
 * Getter usage:
 * ```
 * console.log(getMyState());
 * ```
 */
const createGlobalState = <State>(
	/** The initial value of the global state. */
	initialState: State | (() => State)
): GlobalState<State> => {
	let currentState = typeof initialState === 'function'
		? (initialState as () => State)()
		: initialState;

	const updateStates: UpdateState[] = [];

	/**
	 * The setter function of the global state. Takes a new value for the global state as an argument.
	 *
	 * This can be called inside or outside a React component. Its identity remains the same between renders.
	 */
	const setGlobalState: GlobalStateSetter<State> = state => {
		currentState = typeof state === 'function'
			? (state as (state: State) => State)(currentState)
			: state;

		for (let i = 0; i < updateStates.length; i++) {
			updateStates[i]();
		}
	};

	/**
	 * The React hook for the global state.
	 *
	 * Returns `[globalState, setGlobalState]`, just like a [state hook](https://reactjs.org/docs/hooks-state.html).
	 */
	const useGlobalState: GlobalStateHook<State> = () => {
		const [state, setState] = useState(currentState);

		const updateStateRef = useRef<UpdateState>();

		// `updateState` must be set synchronously so that `setState` calls are effective even before the component is fully mounted.
		if (!updateStateRef.current) {
			const updateState: UpdateState = () => {
				setState(currentState);
			};

			updateState._index = updateStates.push(updateState) - 1;

			updateStateRef.current = updateState;
		}

		useEffect(() => () => {
			// Delete `updateState` from `updateStates` in O(1) by popping the last item and swapping it into this item's place (unless this item is the popped item).
			const lastUpdateState = updateStates.pop()!;
			if (lastUpdateState !== updateStateRef.current!) {
				updateStates[updateStateRef.current!._index] = lastUpdateState;
				lastUpdateState._index = updateStateRef.current!._index;
			}
		}, []);

		return [state, setGlobalState] as const;
	};

	/**
	 * The getter function of the global state. Returns the current value of the state.
	 *
	 * This should only be called outside a React component.
	 */
	const getGlobalState: GlobalStateGetter<State> = () => currentState;

	return [useGlobalState, setGlobalState, getGlobalState] as const;
};

export default createGlobalState;
