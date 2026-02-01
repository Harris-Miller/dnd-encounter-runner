# AGENTS.md

## Do
- place test files in `__tests__` folders
- respect all rules defined in `eslint.config.js` when generating code, making sure never to generate any code that would break a rule. There should not be any eslint errors or warnings in any code you generate
- all new code generated should pass typescript type checking
- type all react function components with `FC`
- use React's `PropsWithChildren` utility type for components that accept child components
- exclude file extensions when importing typescript files

## Don't
- use barrel exports
- use default exports, unless explicitly told otherwise
