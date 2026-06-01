# MUI → Radix UI migration

## Approach

- **Primitives:** Import `@radix-ui/react-*` at call sites (Dialog, Tabs, Tooltip, Label, Avatar, etc.)
- **Icons:** `lucide-react`
- **Palette:** D&D Beyond tokens in `src/styles/global.css` (from former `theme.ts`)
- **Primitive layout:** Minimal classes in `src/styles/radix.css` (overlay, dialog content, dropdown, tabs)
- **No `src/components/ui`:** No MUI-shaped wrapper components; native HTML for buttons, layout, typography
- **Domain-only:** `src/components/Autocomplete.tsx` (combobox behavior, not a design-system shim)

## Theme

- Light/dark via `ColorSchemeProvider` in `src/providers/`
- `html` gets `.light` / `.dark` class

## Verify

```bash
pnpm run typecheck
pnpm run lint
pnpm dev
```
