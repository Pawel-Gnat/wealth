# Product & UI design — personal budget (`apps/web`)

High-level UX and screen requirements. **Architecture mapping** (FSD layers, file locations) is in [`FSD.md`](./FSD.md).

---

## General requirements

- Clean dashboard with **sidebar after authentication**.
- Minimal, modern, professional look; responsive (desktop-first dashboard).
- Reusable UI components; card-based sections; clear hierarchy.
- **English** copy in the UI (via i18n namespaces in `@repo/common`).
- Backend is real (oRPC + API); this doc focuses on screens and interactions.

---

## Routes and pages

### 1. `/auth`

Single auth page: centered card with **Sign In** / **Sign Up** tabs, email + password, submit.

**Implementation:** `pages/auth` → `features/auth-form`.

### 2. `/` — Dashboard

Sidebar layout + main content. Sidebar: logo, Dashboard / Incomes / Expenses links, logout at bottom.

**Content (planned):** heading + summary cards (Total Incomes, Total Expenses, Current Balance).

**Implementation:** `widgets/dashboard-layout`, `pages/dashboard` (summary cards **not yet** implemented).

### 3. `/incomes` and 4. `/expenses`

Paginated table: date, total amount, edit link, delete control. Page title + **Add** button.

**Interactions:**

- Edit → `/incomes/:id` or `/expenses/:id`
- Delete → immediate delete with toast today; **confirmation modal** is planned (see Modal requirements)

**Implementation:**

| Concern | Location |
|---------|----------|
| Route adapters | `pages/incomes`, `pages/expenses` (pass `kind`) |
| List shell (title, add link, card) | `widgets/document-list-page` |
| Table + delete | `features/document-table` |
| Data | `features/document` hooks + `@repo/api` |

### 5–8. Add / edit — `/incomes/new`, `/expenses/new`, `/incomes/:id`, `/expenses/:id`

Shared form: date, multiple **line items** (description, price, quantity), add/remove rows, line totals, save.

**Implementation:**

| Concern | Location |
|---------|----------|
| Route adapters | `pages/incomes`, `pages/expenses` |
| Form shell (heading, loading, error) | `widgets/document-form-page` |
| Form + validation | `features/document-form` |
| Line item row | `features/record-line-items` |
| Per-kind labels, routes, API | `features/document` → `DOCUMENT_CONFIG` + `kind` |

---

## Shared income / expense model

Incomes and expenses are the same **document** shape in the API (line items, date, totals). The UI uses:

- `kind: 'income' | 'expense'` on widgets and features
- `DOCUMENT_CONFIG` for namespace, routes, oRPC client, toast keys

Do **not** duplicate separate `income-form` / `expense-form` feature slices.

---

## Modal requirements (planned)

Reusable **confirmation modal** before delete (title, message, cancel, destructive confirm).

**Current behavior:** delete from table without modal; toast on success/error.

**Future home:** `features/delete-record` or dialog in `document-table` when implemented.

---

## Component map (implemented vs planned)

| UI building block | Status | Location |
|-------------------|--------|----------|
| Auth card + tabs | Done | `features/auth-form` |
| Sidebar navigation | Done | `widgets/dashboard-layout` |
| Document list page | Done | `widgets/document-list-page` |
| Document form page | Done | `widgets/document-form-page` |
| Data table (incomes/expenses) | Done | `features/document-table` |
| Record form + line items | Done | `features/document-form`, `record-line-items` |
| Dashboard summary cards | Planned | `pages/dashboard` / future widget |
| Pagination controls | Partial | table uses API pagination |
| Delete confirmation modal | Planned | — |
| Dedicated “page header” widget | N/A | header lives in `document-list-page` |

---

## Visual style

- Minimal finance-app aesthetic; neutral base + one accent.
- Accessible contrast; hover/focus/active/empty/disabled states.
- Consistent spacing; empty and error states on list/form.

---

## Deliverables checklist

- [x] Auth, sidebar layout, navigation
- [x] Income/expense list and add/edit flows (shared document UI)
- [x] Line-item forms with validation
- [ ] Dashboard summary cards
- [ ] Delete confirmation modal
- [ ] Full pagination UI polish (if beyond current table)
