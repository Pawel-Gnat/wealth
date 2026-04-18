# Frontend architecture (`apps/web`) — Feature-Sliced Design

This document is the **reference** for adding files and slices. Product scope, screens, and UI expectations are described in [`DESIGN.md`](./DESIGN.md) (personal budget, sidebar after login, incomes/expenses, line-item forms, English copy in the UI).

---

## Layers (top to bottom)

Imports flow **downward**: a higher layer may import a lower one; **not** the other way around (e.g. `entities` must not import `pages`).

- **`app`** — `src/app/` — App shell: router, `BrowserRouter`, no domain logic.
- **`pages`** — `src/pages/<page-name>/` — One page = one route (or a tightly related group of views). Compose widgets / features / entities only.
- **`widgets`** — `src/widgets/<widget-name>/` — Composite UI blocks (dashboard layout, page header, summary cards).
- **`features`** — `src/features/<feature-name>/` — A single reusable user-facing behavior (auth card with tabs, delete with modal, line-item editor).
- **`entities`** — `src/entities/<entity-name>/` — Domain: types, optional selectors/mappers; **no** concrete pages.
- **`shared`** — `src/shared/` — Shared primitives: UI kit, `utils`, config (`routes`), i18n.

**Flow** (lower layers do not depend on higher ones): `shared` → `entities` → `features` → `widgets` → `pages` → `app`.

---

## Folder and file conventions

- **Slice** (e.g. `dashboard-layout`, `income`): folder name in **kebab-case**.
- **Typical segments**:
  - `ui/` — React components (`.tsx`).
  - `model/` — types, constants, pure helpers (e.g. `types.ts`).
  - Optional later: `api/`, `lib/` — when backend integration is added.
- **Public slice API**: an `index.ts` at the **slice root** exports only what other layers should import (do not deep-import internal `ui/*` files from outside the slice).

Example already in the repo:

```text
pages/incomes/
  index.ts              → exports IncomeAddPage, IncomeEditPage, IncomesListPage
  ui/
    incomes-list-page.tsx
    income-add-page.tsx
    income-edit-page.tsx
```

---

## Import alias

- Configured alias: **`@/` → `src/`** (Vite + `tsconfig`).
- Prefer: `import { X } from "@/widgets/dashboard-layout"` instead of deep paths into `ui/` from outside that slice.

---

## `app` — what lives here

- **`index.tsx`** — Root: `BrowserRouter` + route tree.
- **`router.ts`** — Re-export of the router (thin layer over `router-tree`).
- **`router-tree.tsx`** — `<Routes>` definition: paths, layouts (`DashboardLayout` as a wrapper with `<Outlet />`).

Add new **routes** in `router-tree.tsx`; keep repeatable paths in **`shared/config/routes.ts`** (`ROUTES`) and use them in navigation (as in `dashboard-layout`).

---

## `pages` — mapping to routing

Pages are grouped **by routing domain** (not by “component type”):

- **`/auth`** → slice `pages/auth` → UI pattern: `auth-page.tsx`.
- **`/`** → slice `pages/dashboard` → UI pattern: `dashboard-page.tsx`.
- **`/incomes`**, **`/incomes/add`**, **`/incomes/:id`** → slice `pages/incomes` → list / add / edit pages.
- **`/expenses`** and related paths → slice `pages/expenses` → same idea as incomes.

**Rule:** a page composes widgets and features; avoid duplication — shared list/add/edit forms belong in **features** (e.g. `record-line-items`, later a shared “record form” for income/expense per `DESIGN.md`).

---

## `widgets` — current state

- **`dashboard-layout`** — sidebar + `Outlet` (Dashboard, Incomes, Expenses, Logout); uses `ROUTES`.
- **`page-header`** — title row with a primary action (e.g. “Add Income”).
- **`summary-cards`** — dashboard summary cards.

A new composite block used on **multiple pages** → new folder under `widgets/<name>/` + `index.ts`.

---

## `features` — planned / stubs

The repo has **placeholders** (comment + `export {}`) aligned with `DESIGN.md`:

- **`auth-form`** — Auth card with Sign In / Sign Up tabs, email/password fields.
- **`delete-record`** — Delete income/expense with a confirmation modal.
- **`record-line-items`** — Line items (description, price, quantity), totals, add/remove actions.

**Validation schemas** usually live in the workspace (`packages/`) — as noted in `auth-form`; the web app wires the form only.

---

## `entities`

- **`income`**, **`expense`** — for now mostly **`model/types.ts`** (e.g. `IncomeId` as string); keep domain types and DTO → UI mapping here, not in `pages`.

If a shared record model emerges (income vs expense), consider `entities/record` or shared types from `packages/`.

---

## `shared`

- **`config/routes.ts`** — Single source of path strings (`ROUTES.*`).
- **`lib/ui/*`** — Primitives and composite controls (button, card, dialog, pagination, …) — **no** domain logic.
- **`lib/utils.ts`** — `cn()` and helpers.
- **`lib/i18n.ts`** — i18n bootstrap (`initI18n` from `@repo/common`).
- **`components/<slice>/`** — Composed UI (e.g. form wrappers, typography, card). Each slice has an **`index.ts`** barrel at its root — import from `@/shared/components/<slice>` (or `@/shared/components` for the aggregated barrel), **not** from deep paths like `.../form/form-input.tsx`.

UI copy: **`DESIGN.md` requires English** for labels; translations may still go through i18n (e.g. `dashboard` namespace on `dashboard-page`).

---

## Where to add new code — quick decision

1. **New route / screen** → `pages/<area>/ui/...`, export in `pages/<area>/index.ts`, entry in `router-tree.tsx` + `ROUTES` if needed.
2. **Same layout as the income list but another domain** → new page under `pages/`, shared table/list as a **widget** or **feature** if reused.
3. **Single action (e.g. delete modal)** → `features/<name>/`.
4. **Business entity type or name** → `entities/<entity>/model/`.
5. **Button / input used everywhere** → `shared/lib/ui/`.
6. **Composed building blocks (app-level form/typography wrappers)** → `shared/components/<slice>/` with a barrel `index.ts`.

---

## Monorepo dependencies

- **`@repo/common`** — i18n, language resources (`types.d.ts` augments `i18next`).
- **`packages/api`** (contracts, routers) — data wiring will typically live in **features** or a thin `api` segment under **entities**, without mixing HTTP into page `ui/`.

---

## Current snapshot

The router and dashboard layout are in place; many pages are still **stubs**. Prefer implementing **features and widgets** under this split and keeping **pages** as thin composition so FSD stays consistent and scales cleanly against `DESIGN.md`.
