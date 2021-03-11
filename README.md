# React Global State

This package provides simple global state management through React hooks.

* No extra files or React components required
* No dependencies but React itself
* Very small bundle size (< 1 kB)

# Usage

## Create the global state

```ts
import createGlobalState from 'react-global-state';

const [useMyState, setMyState] = createGlobalState(initialValue);
```

## Use the global state

```ts
const MyComponent = () => {
	const [myState, setMyState] = useMyState();
	
	// ...
};
```

## Set the global state

The setter function can be called **inside or outside** a React component.
```ts
setMyState(newValue);
```

# Best Practice

## Export and import

You can easily export the hook or the setter from one file and import it into another:

```ts
// myState.ts
export const [useMyState, setMyState] = createGlobalState(initialValue);
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

This will unnecessarily attempt to re-render the component whenever the state updates, since it is using the hook. Instead, you could simply import the setter without the hook:

```ts
// ✅ Do this.

import { setMyState } from './myState';

const MyComponent = () => {
	// Call `setMyState` in here.
};
```

No hook required!