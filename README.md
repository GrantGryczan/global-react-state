# React Super State

This package provides simple global state management through React hooks.

* No extra files or React components required
* No dependencies but React itself
* Very small bundle size (< 1 kB)

# Usage

## Create the super state
```ts
import createSuperState from 'react-super-state';

const [useMyState, setMyState] = createSuperState(initialValue);
```

## Use the super state
```ts
const MyComponent = () => {
	const [myState, setMyState] = useMyState();
	
	// ...
};
```

## Set the super state

The setter function can be called **inside or outside** a React component.
```ts
setMyState(newValue);
```

# Best Practice

## Export and import

You can easily export the hook or the setter from one file and import them into another:

```ts
// myState.ts
export const [useMyState, setMyState] = createSuperState(initialValue);
```

```ts
import { useMyState } from './myState';
```

## Avoid unnecessary re-render attempts

Because the setter function can also be called outside a component, it is _never_ necessary to do this:

```ts
// ❌ DON'T do this.

import { useMyState } from './myState';

const MyComponent = () => {
	const [, setMyState] = useMyState();
	
	// Call `setMyState` in here.
};
```

This will unnecessarily attempt to re-render the component which uses the hook whenever the state updates. Instead, you could simply import the setter without the hook:

```ts
// ✅ Do this.

import { setMyState } from './myState';

const MyComponent = () => {
	// Call `setMyState` in here.
};
```
No hook required!