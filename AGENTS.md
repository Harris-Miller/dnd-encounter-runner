# AGENTS.md

## Do
- use `pnpm`, not `npm` for relevant CLI commands
- place test files in `__tests__` folders
- respect all rules defined in `eslint.config.js` when generating code, making sure never to generate any code that would break a rule. There should not be any eslint errors or warnings in any code you generate
- all new code generated should pass typescript type checking
- before considering any code change complete, ensure it would pass pnpm run typecheck and pnpm run lint with zero errors and zero warnings. Fix any type or lint issues before finishing.
- type all react function components with `FC`
- use React's `PropsWithChildren` utility type for components that accept child components
- exclude file extensions when importing typescript files in `src/`; under `db/`, use explicit `.ts` extensions on relative imports so Node can execute those modules natively (see `tsconfig.node.json`)
- take an immutable value approach to all code
- throw descriptive errors instead of silently returning when encountering invalid state or missing data
- use `R.assocPath` for nested state updates in Zustand stores, calling `set(R.assocPath([...path], value))` directly without wrapping in objects
- prefer `findIndex` + direct index access over mapping entire arrays when updating a single item in a collection
- use native array methods (`.filter()`, `.map()`, `.sort()`) when they're clearer than Ramda equivalents
- use the `sortBy` utility function for sorting instead of custom comparator functions
- use spread operators for simple object creation instead of Ramda pipe/assoc chains
- use descriptive variable names like `nextCharacters`, `updatedEffects`, `indexOfCharacter` to indicate transformed state

## Don't
- use barrel exports
- use default exports, unless explicitly told otherwise
- start with empty arrays and add to them via conditionals
- silently return early on invalid state - throw descriptive errors instead
- wrap `R.assocPath` calls in objects when updating Zustand state - pass the result directly to `set()`
- use `R.map` to update a single item when `findIndex` + direct update is more efficient
