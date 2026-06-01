# MUI → Radix UI migration

## Approach

- **Primitives:** `@radix-ui/react-*` (Dialog, Dropdown, Tabs, Select patterns, Tooltip, etc.)
- **Icons:** `lucide-react` (replaces `@mui/icons-material`)
- **Styling:** CSS custom properties in `src/styles/global.css` (D&D Beyond palette from former `theme.ts`)
- **Wrappers:** `src/components/ui/*` provide MUI-like APIs (`Button`, `TextField`, `Stack`, …) to limit route churn

## Theme

- Light/dark via `ColorSchemeProvider` (`localStorage` + `prefers-color-scheme`)
- `html` gets `.light` / `.dark` class (`colorSchemeSelector` equivalent)

## Not migrated 1:1

- MUI `sx` → inline `style` / utility classes
- MUI `Autocomplete` → lightweight combobox in `ui/Autocomplete.tsx`
- Some density/spacing may differ slightly

## Verify

```bash
pnpm run typecheck
pnpm run lint
pnpm dev
```
