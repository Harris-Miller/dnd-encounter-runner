# AGENTS.md

## Rules
- use `pnpm`, not `npm` for relevant CLI commands
- place test files in `__tests__` folders
- respect all rules defined in `eslint.config.js` when generating code, making sure never to generate any code that would break a rule. There should not be any eslint errors or warnings in any code you generate
- all new code generated should pass typescript type checking
- before considering any code change complete, ensure it would pass `pnpm run typecheck` and `pnpm run lint` with zero errors and zero warnings. Fix any type or lint issues before finishing.
- type all react function components with `FC`
- use React's `PropsWithChildren` utility type for components that accept child components
- exclude file extensions when importing typescript files in `src/`; under `db/`, use explicit `.ts` extensions on relative imports so Node can execute those modules natively (see `tsconfig.node.json`)
- take an immutable value approach to all code
- throw descriptive errors instead of silently returning when encountering invalid state or missing data
- define encounter domain types in `src/types/encounterState.ts` with Zod schemas; infer TS types via `z.infer` and parse persisted JSONB with the schemas
- keep server/async state in TanStack Query: put Supabase access in `src/api/<resource>.ts`, export `queryOptions` / `mutationOptions`, consume via `useQuery` / `useMutation` in routes and components
- apply encounter state changes through pure functions in `src/services/encounterReducer.ts` and the `useApplyTransform` hook (optimistic client reducer, then Supabase RPC, then authoritative server state)
- use `ts-pattern` `match(...).exhaustive()` for discriminated unions (`Transform`, RPC dispatch, etc.)
- use spread operators and `R.assocPath` for nested updates inside pure reducers/services, not in client stores
- use native array methods (`.filter()`, `.map()`, `.sort()`) when they're clearer than Ramda equivalents
- use descriptive variable names like `nextCombatants`, `optimisticState`, `indexOfCombatant` to indicate transformed state
- place encounter UI in `src/components/encounter/` and file routes under `src/routes/`
- after `pnpm run db:migrate` (schema or RPC SQL), run `pnpm run db:gen-types`; when adding encounter transforms, update the reducer, `Transform` union, RPC migration, and `rpcParity.test.ts`
- use `src/services/__tests__/fixtures.ts` (`buildId`, `FIXED_NOW`, `buildState`) for deterministic reducer/engine tests; RPC parity tests need `DATABASE_URL` in `.env.development` and skip when unset

- NEVER use barrel exports
- NEVER use default exports, unless explicitly told otherwise
- NEVER start with empty arrays and add to them via conditionals
- NEVER silently return early on invalid state - throw descriptive errors instead
- NEVER apply encounter `state` mutations from the UI without `useApplyTransform`
- NEVER manually edit `src/types/database.gen.ts`. run `pnpm run db:gen-types` after `pnpm run db:migrate`
- NEVER manually edit `src/routeTree.gen.ts`. run `pnpm run routes:gen` after updates in `src/routes/`

### MCP
- if you are doing supabase work and want to use their MCP server, don't use the cursor plugin `supabase`, use the locally defined `supabase-local` instead

### Zod
- Use PascalCase for variable names from `z.` constructor functions. Don't put "Schema" at the end name the type from `z.infer<>` the exact same! This way the concrete instance _and_ it's type can be represented by the same name. This overloading is a good practice in Typescript
