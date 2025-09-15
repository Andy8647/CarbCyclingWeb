# Repository Guidelines

## Project Structure & Module Organization
- `src/` – app code. Key areas: `components/{ui,core,layout,shared}`, domain logic in `lib/` (e.g., `calculator.ts`, contexts, i18n, persistence), assets in `assets/`, entry in `main.tsx`/`App.tsx`.
- Tests – colocated under `src/lib/__tests__` and `*.test.ts(x)`.
- Tooling – `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `.prettierrc`.
- Other – `docs/`, `scripts/`, `index.html`, build output in `dist/`.

## Build, Test, and Development Commands
- `npm run dev` – start Vite dev server with HMR.
- `npm run build` – type-check (`tsc -b`) and build to `dist/`.
- `npm run preview` – preview the production build.
- `npm run lint` – run ESLint; fix issues before PRs.
- `npm run format` / `format:check` – Prettier write/check.
- `npm run test` | `test:run` | `test:ui` – Vitest in watch/CI/UI modes.
- `npm run cli` – run `src/cli.ts` if developing the CLI utilities.

## Coding Style & Naming Conventions
- TypeScript + React, Tailwind CSS for styling. Prefer utility classes; share styles in `src/index.css` only when needed.
- Prettier: 2-space indentation, semicolons, single quotes, width 80.
- ESLint: TypeScript + React Hooks rules; keep CI clean.
- Filenames: components under `components/core|layout|shared` use `PascalCase.tsx` (e.g., `ResultCard.tsx`); `components/ui` favors kebab-case (e.g., `slider-section.tsx`). Hooks/utilities use kebab-case (`use-local-storage.ts`). Component exports are PascalCase.

## Testing Guidelines
- Frameworks: Vitest (+ jsdom) and Testing Library. Setup at `src/test/setup.ts`.
- Location/patterns: colocate with source in `__tests__/` or `*.test.ts(x)`.
- Focus on behavior and accessibility. Mock IO where needed; avoid testing Tailwind styles directly.
- Run locally via `npm run test`; use `test:run` in CI.

## Commit & Pull Request Guidelines
- Use Conventional Commits as in history: `feat: ...`, `fix: ...`, `docs: ...`, `style: ...`. Optional scope: `feat(ui): ...`.
- Branch names: `feat/<short-slug>` or `fix/<issue-id>`.
- PRs include: clear description, linked issues, screenshots/GIFs for UI, and a checklist confirming `lint`, `test`, and `build` pass.

## Architecture Notes
- State via lightweight React context/hooks in `src/lib/*-context.tsx`.
- i18n with `i18next` (`src/lib/i18n.ts`).
- Drag-and-drop via `@dnd-kit/*` and Atlaskit pragmatic DnD.
- Persistence uses `localStorage` helpers (`use-local-storage.ts`, `use-app-persistence.ts`).
