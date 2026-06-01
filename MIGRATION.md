# MUI → Radix Themes migration

## Approach

- **UI:** [`@radix-ui/themes`](https://www.radix-ui.com/themes) components (`Button`, `Dialog`, `TextField`, `Card`, `Flex`, etc.)
- **Icons:** `lucide-react`
- **Palette:** D&D Beyond tokens in `src/styles/global.css`, mapped onto Themes via `.radix-themes` CSS variables (`--red-9`, etc.)
- **Theme shell:** `<Theme accentColor="ruby" appearance={…}>` in `App.tsx`, driven by `ColorSchemeProvider`
- **Routing links:** `RouterLink` = `createLink(Link)` from Themes
- **Domain-only:** `src/components/Autocomplete.tsx` (combobox; uses Themes `Box` for layout)

## Intentional exceptions

- Hidden `<input type="file">` for avatar upload
- Native `<select multiple>` where multi-select is required (Themes `Select` is single-value)
- Plain `<button>` on full-width card rows in some list UIs

## Verify

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm dev
```
