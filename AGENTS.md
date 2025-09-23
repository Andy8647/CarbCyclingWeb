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

# Refactor Plan

## Large File Decomposition

- src/components/core/MealSlotPlanner.tsx → split into container, SlotSection, PortionCard,
  QuickAddModal; move helpers to src/lib/meal-slot-utils.ts.
- src/components/core/ResultCard.tsx → extract data logic to src/lib/result-card-logic.ts;
  create focused subcomponents under src/components/core/result-card/.
- src/lib/i18n.ts → break into namespace modules (e.g., lib/i18n/core.ts, lib/i18n/meal-
  planner.ts) and re-export via an index.
- src/components/core/FoodLibraryPanel.tsx → move filter/search logic into
  useFoodLibraryFilters (src/lib/hooks/); split list/item views into components/core/food-
  library/.
- src/components/core/InputForm.tsx → carve grouped sections (user settings, targets,
  validation) into smaller child components.
- src/components/core/IOSGridLayout.tsx → extract layout math/drag adapters to src/lib/
  grid-layout.ts; keep JSX wrapper lean.

## Trim Unnecessary Effects

- MealSlotPlanner → replace useEffect re-syncing servings with derived values; handle
  pending food selection inline post onAddCustomFood.
- MealSlotPlanner → eliminate useEffect toggling quick add visibility by deriving state
  from isAdding and callbacks.
- App.tsx → convert training config useEffect to useMemo/useCallback with proper deps.
- Review remaining hooks after decomposition, preferring memoized computations over
  state+effect pairs.

## Additional Cleanups

- Centralize meal planner helpers in src/lib/meal-planner.ts; expose granular functions for
  shared use.
- Create hook modules (useMealSlotState, useQuickAddForm) under src/lib/hooks/ for
  refactored components.
- Share prop types via src/components/core/meal-slot/types.ts to keep cross-file typing
  aligned.
- Expand tests (src/lib/__tests__/calculator.test.ts + new files) to cover extracted
  utilities and quick-add flows.
