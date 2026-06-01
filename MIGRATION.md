# MUI → shadcn/ui migration

## Approach

1. **Remove MUI** — replaced with Radix-backed compat wrappers, then shadcn/ui primitives.
2. **shadcn/ui** — components live in `src/components/ui/` (CLI-managed).
3. **Compat layer** — `src/components/compat/` preserves prior MUI-like props (`variant="contained"`, `DialogTitle`, etc.) while delegating to shadcn where wired.
4. **Icons** — `lucide-react` (replaces `@mui/icons-material`).
5. **Styling** — Tailwind v4 + D&D Beyond tokens in `src/styles/global.css` (mapped to shadcn CSS variables).

## Theme

- Light/dark via `ColorSchemeProvider` (`localStorage` + `prefers-color-scheme`)
- `html` gets `.light` / `.dark` class
- shadcn semantic tokens (`--primary`, `--background`, …) reference DDB palette variables

## Supabase UI

- Auth screens can adopt [@supabase/ui](https://supabase.com/ui) patterns incrementally; not required for core encounter flows.

## Not migrated 1:1

- Some compat components still use legacy CSS classes (`Typography`, `Stack`, `Paper`, …) until ported to Tailwind/shadcn.
- MUI `Autocomplete` → lightweight combobox in `compat/Autocomplete.tsx`
- Full removal of `compat/` in favor of direct `@/components/ui/*` imports is follow-up work.

## Verify

```bash
pnpm run typecheck
pnpm run lint
pnpm dev
```
