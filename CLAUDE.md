# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is
A OneNote-style note-taking SPA. Local-only — all data lives in browser `localStorage` under the key `onenote-mimic-v1`. No backend.

## Stack
- Vite + React 18 + TypeScript
- Tailwind CSS v3 (config in `tailwind.config.js`, directives in `src/index.css`)
- TipTap (`@tiptap/react` + `@tiptap/starter-kit`) for the rich text editor
- Zustand with `persist` middleware for state + localStorage
- `nanoid` for IDs, `lucide-react` for icons

## Commands
- `npm run dev` — Vite dev server (default http://localhost:5173)
- `npm run build` — `tsc -b && vite build`
- `npm run preview` — preview the production build

There are no tests.

## Architecture

Four-pane horizontal layout in `src/App.tsx`:
1. `Sidebar` — notebooks
2. `SectionList` — sections of the selected notebook
3. `PageList` — pages of the selected section
4. `Editor` — TipTap editor for the selected page

### Data model (`src/types.ts`)
```
Notebook { id, name, sections: Section[] }
Section  { id, name, color, pages: Page[] }
Page     { id, title, contentHTML, updatedAt }
```
Three-level nesting. Content is stored as HTML strings produced by TipTap.

### State (`src/store/useNotebooksStore.ts`)
- Single Zustand store holds `notebooks` and `selected { notebookId, sectionId, pageId }`.
- All mutations are CRUD actions on that tree (`addNotebook`, `addSection`, `addPage`, `updatePageContent`, etc.). They produce new arrays — never mutate in place.
- Persisted to `localStorage` via Zustand's `persist` middleware. Bumping the schema requires bumping the `name` key (currently `onenote-mimic-v1`) or adding a migration.
- `findSelection(notebooks, selected)` is the helper for resolving the current `{ notebook, section, page }` triple — use it instead of re-implementing the lookup in components.

### Editor (`src/components/Editor.tsx` + `EditorToolbar.tsx`)
- `useEditor` is called **without a deps array**. Switching pages does NOT recreate the editor — a `useEffect` on `page?.id` calls `editor.commands.setContent(...)` to swap content. Passing deps to `useEditor` previously caused "Cannot read properties of null (reading 'cached')" because `onUpdate` from a destroyed instance fired against a torn-down schema. Don't reintroduce a deps array.
- Content saves are debounced 300 ms inside `onUpdate` before calling `updatePageContent`.
- The toolbar uses `editor.isActive(...)` to highlight active marks/nodes; commands are chained via `editor.chain().focus().<cmd>().run()`.

### Styling
- Tailwind utility classes throughout. Custom palette under `colors.onenote.*` in `tailwind.config.js` (`purple`, `purpleDark`, `purpleLight`).
- ProseMirror element styles (headings, lists, blockquote, code, placeholder) live in `src/index.css` — TipTap is headless so editor typography must be styled there, not via Tailwind classes on the component.

## Conventions
- Components are function components with named exports (except `App`, which is the default export).
- Keep CRUD logic in the Zustand store; components should only read state and call actions.
- When adding a new field to `Page` / `Section` / `Notebook`, update `types.ts`, the seed data, and any `new*()` factory in the store together.
- Don't reach into `localStorage` directly — go through the store.

## Things to be careful with
- **Persistence schema**: editing the shape of `notebooks` without a migration will leave existing users on stale data. Either tolerate the old shape, write a migration, or bump the `persist` `name`.
- **StrictMode double-mount**: the editor lifecycle is sensitive to it. Any change touching `useEditor` setup should be tested with a page switch under React StrictMode (dev mode is StrictMode).
- **TipTap version**: `@tiptap/starter-kit` includes `@tiptap/pm`. If you add other TipTap extensions, match the major version.
