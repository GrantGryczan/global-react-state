import { useState, useEffect } from 'react';

/**
 * Creates a super state. Returns the state's hook function and setter function.
 * 
 * Usage:
 * ```
 * const [useMyState, setMyState] = createSuperState(initialValue);
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
 */
const createSuperState = <StateType>(
	/** The initial value of the super state. */
	initialState: StateType
) => {
	let currentState = initialState;

	const updateStates: Array<() => void> = [];

	/**
	 * The setter function of the super state. Takes a new value for the super state as an argument.
	 *
	 * This can be called inside or outside a React component. Its identity remains the same between renders.
	 */
	const setSuperState = (newState: StateType) => {
		currentState = newState;
		for (let i = 0; i < updateStates.length; i++) {
			updateStates[i]();
		}
	};

	/**
	 * The React hook for the super state.
	 * 
	 * Returns `[superState, setSuperState]`, just like a [state hook](https://reactjs.org/docs/hooks-state.html).
	 */
	const useSuperState = () => {
		const [state, setState] = useState(currentState);

		useEffect(() => {
			const updateState = () => {
				setState(currentState);
			};
			
			updateState._index = updateStates.push(updateState) - 1;

			return () => {
				// Delete `updateState` from `updateStates` in O(1) by swapping the last item into its place and popping the last item.
				const lastUpdateState = updateStates.pop() as typeof updateState;
				updateStates[updateState._index] = lastUpdateState;
				lastUpdateState._index = updateState._index;
			};
		}, []);

		return [state, setSuperState];
	};

	return [useSuperState, setSuperState] as const;
};

export default createSuperState;