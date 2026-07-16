# Frontend architecture (`apps/web`) — Feature-Sliced Design

This document is the **reference** for adding files and slices. Product scope, screens, and UI expectations are described in [`DESIGN.md`](./DESIGN.md).

---

## Layers (top to bottom)

Imports flow **downward**: a higher layer may import a lower one; **not** the other way around (e.g. `features` must not import `pages`).

- **`app`** — `src/app/` — App shell: router (`AppRouter`), layouts, route constants (`routes.ts`).
- **`pages`** — `src/pages/<domain>/` — Route entry points. Thin wrappers that pass `kind` or domain-specific props into **widgets**.
- **`widgets`** — `src/widgets/<name>/` — Composite UI used on multiple routes (dashboard layout, document list/form shells).
- **`features`** — `src/features/<name>/` — User-facing behavior (auth forms, document table/form, API hooks).
- **`shared`** — `src/shared/` — UI kit, helpers, oRPC client, i18n bootstrap.

**There is no `entities` layer in `apps/web`.** Domain types and Zod schemas live in **`@repo/api`** (`packages/api`). Do not mirror them in FSD `entities` slices.

**Flow:** `shared` → `features` → `widgets` → `pages` → `app`.

---

## Folder and file conventions

- **Slice** name: **kebab-case** (`document-form`, `dashboard-layout`).
- **Segments:** `ui/`, `model/`, `api/` as needed.
- **Public API:** `index.ts` at slice root — other layers import only from the barrel.

Example — incomes routing domain:

```text
pages/incomes/
  index.ts                    → exports IncomesListPage, IncomeFormPage
  ui/
    incomes-list-page.tsx     → <DocumentListPage kind="income" />
    income-form-page.tsx      → <DocumentFormPage kind="income" />
```

---

## Import alias

- **`@/` → `src/`** (Vite + `tsconfig`).
- Prefer `import { X } from "@/widgets/document-list-page"` over deep `ui/` paths.

---

## `app`

| File | Role |
|------|------|
| `routes.ts` | `APP_ROUTES` — single source of path strings |
| `router.tsx` | `AppRouter` — `<Routes>` tree |
| `authenticated-layout.tsx` / `unauthenticated-layout.tsx` | Auth guards |

Add routes in `router.tsx`; add path helpers in `routes.ts`.

---

## `pages`

One slice per **routing domain** (`auth`, `dashboard`, `incomes`, `expenses`).

| Route | Page slice | Widget / feature |
|-------|------------|------------------|
| `/auth` | `pages/auth` | `features/auth-form` |
| `/` | `pages/dashboard` | `features/dashboard` (`DashboardContent`) |
| `/incomes`, `/incomes/new`, `/incomes/:id` | `pages/incomes` | `widgets/document-list-page`, `document-form-page` with `kind="income"` |
| `/expenses`, … | `pages/expenses` | same widgets with `kind="expense"` |

**Rule:** pages stay thin; shared list/form layout lives in **widgets**; table/form logic in **features**.

---

## `widgets` — current

| Widget | Role |
|--------|------|
| `dashboard-layout` | Sidebar + `<Outlet />` (Dashboard, Incomes, Expenses, Logout) |
| `document-list-page` | Heading, “Add” link, card + `DocumentTable` |
| `document-form-page` | Heading, loading/error states, card + `DocumentForm` |

New composite block reused across routes → `widgets/<name>/` + `index.ts`.

---

## `features` — current

| Feature | Role |
|---------|------|
| `auth-form` | Sign in / sign up tabs and forms |
| `document` | `RecordKind`, `DOCUMENT_CONFIG`, hooks: list / one / upsert / delete |
| `document-table` | Paginated table, columns, delete action |
| `document-form` | Create/edit form, skeleton |
| `record-line-items` | Single line item row (`DocumentLineItem`) |

Income and expense share these via **`kind: 'income' | 'expense'`** and `getDocumentConfig(kind)`. **Do not** add `expense-*` / `income-*` wrapper features.

Per-kind settings (i18n namespace, routes, oRPC client, toast keys) live in `features/document/model/document-config.ts`.

---

## `shared`

- **`components/`** — App-level composed UI (buttons, card, form fields, table shell).
- **`lib/orpc/`** — oRPC client wired to `@repo/api` contracts.
- **`lib/i18n/`** — `init18nWeb` (uses `@repo/common` resources).
- **`helpers/`** — e.g. price formatting.

Validation schemas: **`@repo/api/schemas`** (Zod). Features wire forms to those types.

---

## Where to add new code

1. **New route** → `pages/<area>/ui/`, export in `index.ts`, register in `AppRouter` + `APP_ROUTES`.
2. **Same list/form for income & expense** → extend `document-*` features or `document-*-page` widgets; pass `kind`.
3. **One-off page chrome** (title + primary action) → widget if reused; else keep in page.
4. **API type or contract** → `packages/api`, not `apps/web`.
5. **Primitive control** → `shared/components` or `shared/lib/ui`.

---

## Monorepo dependencies

- **`@repo/common`** — i18n resources, `initI18n`.
- **`@repo/api`** — schemas, oRPC contracts; consumed via `orpcClient` in features.

---

## Current snapshot

- Router, auth, dashboard layout, **dashboard summary widgets + chart**, and full **income/expense** CRUD UI are implemented.
- **Delete confirmation modal** is described in `DESIGN.md` but not built yet.
- Tests for document table/form live under `features/document-*/ui/*.test.tsx`.

Keep **pages** as thin route adapters and **features** as the place for behavior and data.
