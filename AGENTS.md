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
- **`pages`** — `src/pages/<slice>/` — route entry points. **Own the full screen logic** (hooks, helpers, UI), including pieces shared by routes of that same slice.
- **`widgets`** — `src/shared/widgets/<slice>/` — reused **presentational** composites (little or no domain logic). Example: `page-loader`, `card-state`. Route shells live in `src/shared/layouts` (example: `dashboard-layout`).
- **`shared`** — `src/shared/` — UI kit, config, helpers, oRPC, i18n.

There is **no `entities` layer**. Domain types and Zod schemas live in `@repo/api` (`packages/api`).

Placement rules:

1. Screen logic stays in the **`pages`** slice that owns the domain, including when several of its routes share it.
2. Reused + mostly presentation → extract to **`widgets`**.
3. Cross-cutting primitives / config / clients → **`shared`**.
4. API contracts and schemas → **`packages/api`**, not `apps/web`.

Conventions:

- Slice names: kebab-case.
- Prefer public API via slice `index.ts` / `index.tsx`; other layers import from the barrel, not deep `ui/` paths.
- Alias: `@/` → `src/`.
- Income and expense share the records screens via `kind: 'income' | 'expense'` (`RecordKind` from `@repo/api/types`) and `getRecordConfig(kind)` in `pages/records/config`. Do not add separate `expense-*` / `income-*` page wrappers.
- `pages/records` owns the list, the form, and the detail (`/records/:id`). Personal routes are `/records/new` and `/records/:id/edit`. The same form is also mounted at `/budgets/:budgetId/new` and `/budgets/:budgetId/:recordId/edit`, and the preview at `/budgets/:budgetId/:recordId`. `/records` lists personal records. `/budgets/:budgetId` reuses that list with `records.list({ budgetId })`. Create stores `budgetId` when the form was opened from a budget and then returns to that budget; otherwise it stores `null` and returns to `/records`. Get, update, and delete allow a personal record for its owner and a budget record for someone with access to that budget. After delete, navigation returns to the budget when the record belongs to one, otherwise to `/records`. Lists are ordered by document date descending, then by record id descending.
- `pages/budgets` is the budget list at `/budgets`.

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
- Request schemas: write (body) → `*PayloadSchema`; read (query/path) → `*ParamsSchema`.

## Web tests (MSW)

- Happy-path API responses for feature tests belong in `apps/web/src/test/mocks/handlers.ts` and are registered on the shared MSW server.
- Success / default cases should rely on those handlers — do not duplicate the same payload with `server.use` in the test.
- Use `server.use(...)` only to override the default for that case (e.g. error status, empty list, hanging/loading response).
