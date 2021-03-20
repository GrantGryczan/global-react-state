import { useState, useEffect } from 'react';

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
const createGlobalState = <StateType>(
	/** The initial value of the global state. */
	initialState: StateType
) => {
	let currentState = initialState;
	
	const updateStates: Array<() => void> = [];
	
	/**
	 * The setter function of the global state. Takes a new value for the global state as an argument.
	 *
	 * This can be called inside or outside a React component. Its identity remains the same between renders.
	 */
	const setGlobalState = (newState: StateType) => {
		currentState = newState;
		for (let i = 0; i < updateStates.length; i++) {
			updateStates[i]();
		}
	};
	
	/**
	 * The React hook for the global state.
	 * 
	 * Returns `[globalState, setGlobalState]`, just like a [state hook](https://reactjs.org/docs/hooks-state.html).
	 */
	const useGlobalState = () => {
		const [state, setState] = useState(currentState);
		
		useEffect(() => {
			const updateState = () => {
				setState(currentState);
			};
			
			updateState._index = updateStates.push(updateState) - 1;
			
			return () => {
				// Delete `updateState` from `updateStates` in O(1) by popping the last item and swapping it into this item's place (unless this item is the popped item).
				const lastUpdateState = updateStates.pop() as typeof updateState;
				if (lastUpdateState !== updateState) {
					updateStates[updateState._index] = lastUpdateState;
					lastUpdateState._index = updateState._index;
				}
			};
		}, []);
		
		return [state, setGlobalState] as const;
	};
	
	/**
	 * The getter function of the global state. Returns the current value of the state.
	 *
	 * This should only be called outside a React component.
	 */
	const getGlobalState = () => currentState;
	
	return [useGlobalState, setGlobalState, getGlobalState] as const;
};

export default createGlobalState;