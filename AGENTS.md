<!-- BEGIN @pawel-gnat/ai-toolkit -->
# Pawel — global AI rules

## Comments

- Do not add unnecessary comments to code.
- If you believe a comment on a specific line is necessary, stop and ask the developer for confirmation before adding it.

## File safety and git

- Do not delete files on your own — always ask for permission before deleting anything.
- Do not add files to the project or commit to git without explicit approval.

## Code conventions

- File naming in code: kebab-case.
- Prefer arrow functions over function declarations.
<!-- END @pawel-gnat/ai-toolkit -->

## Architecture decisions

- Read and follow `docs/ADR.md` for accepted architecture decisions (e.g. auth session / logout scope). Do not contradict an ADR without updating that file.

## Frontend structure (`apps/web`)

Layered layout inspired by FSD, with **page-centric** ownership of screen logic. Imports flow downward only (higher layers may import lower ones; never the reverse).

Layers (top → bottom):

- **`app`** — `src/app/` — router, route constants, auth layouts.
- **`pages`** — `src/pages/<slice>/` — route entry points. **Own the full screen logic** (hooks, helpers, UI) unless that logic is reused elsewhere.
- **`features`** — `src/features/<slice>/` — reused slices that contain **behavior / data logic** (API hooks, forms, tables). Example: `document-list-page`, `document-form-page` shared by incomes and expenses via `kind`.
- **`widgets`** — `src/widgets/<slice>/` — reused **presentational** composites (little or no domain logic). Example: `dashboard-layout`, `page-loader`.
- **`shared`** — `src/shared/` — UI kit, config, helpers, oRPC, i18n.

There is **no `entities` layer**. Domain types and Zod schemas live in `@repo/api` (`packages/api`).

Placement rules:

1. Logic used by **one** route/domain → keep it in that **`pages`** slice.
2. Reused + has logic → extract to **`features`**.
3. Reused + mostly presentation → extract to **`widgets`**.
4. Cross-cutting primitives / config / clients → **`shared`**.
5. API contracts and schemas → **`packages/api`**, not `apps/web`.

Conventions:

- Slice names: kebab-case.
- Prefer public API via slice `index.ts` / `index.tsx`; other layers import from the barrel, not deep `ui/` paths.
- Alias: `@/` → `src/`.
- Income and expense share document UI via `kind: 'income' | 'expense'` and `getDocumentConfig(kind)` — do not add separate `expense-*` / `income-*` feature wrappers for the same behavior.

## ShadCN UI

- Try to use components from /shared folder, shadcn library keeps raw components inside /ui folder.
- If you need to use components from /ui folder, analyze then if you need to create a reusable component inside /shared folder.
- **Installing shadcn components:** always use the CLI from `apps/web` — do not add peer dependencies (e.g. `recharts` for `chart`) manually with `pnpm add`:

  ```bash
  cd apps/web && pnpm dlx shadcn@latest add <component>
  ```

  Example: `pnpm dlx shadcn@latest add chart` creates `src/shared/lib/ui/chart.tsx` and installs `recharts`.

- `// @ts-nocheck` on files in `shared/lib/ui` is applied automatically by `apps/web/scripts/patch-ui-ts-nocheck.mjs` (`pnpm ui:patch-ts-nocheck`) via the lefthook pre-commit hook — do not run it manually.

## Database migrations (Drizzle)

- Never create or edit SQL files in `apps/backend/drizzle/` by hand.
- After changing Drizzle table schemas in `apps/backend`, generate migrations:

  ```bash
  cd apps/backend && pnpm db:generate
  ```

- Apply with `pnpm db:migrate` (from `apps/backend`).

## API schemas (`@repo/api`)

- All Zod schemas live in `packages/api/src/schemas/` only — do not define validation schemas in `apps/web` or `apps/backend`.

## Web tests (MSW)

- Happy-path API responses for feature tests belong in `apps/web/src/test/mocks/handlers.ts` and are registered on the shared MSW server.
- Success / default cases should rely on those handlers — do not duplicate the same payload with `server.use` in the test.
- Use `server.use(...)` only to override the default for that case (e.g. error status, empty list, hanging/loading response).
