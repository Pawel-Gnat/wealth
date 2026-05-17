---
title: Use @repo/api and skip redundant entities
impact: HIGH
impactDescription: avoids duplicate types and aligns FSD features with oRPC contracts
tags: monorepo, orpc, fsd, api, wealth
---

## Use @repo/api and skip redundant entities

In the wealth monorepo, API shapes and validation live in `packages/api` (`@repo/api`). The web app consumes them through oRPC — not through a parallel FSD `entities` layer.

**Incorrect: duplicate domain types in entities**

```typescript
// apps/web/src/entities/expense/model/types.ts
export type ExpenseFormValues = {
  date: Date
  lineItems: { title: string; singleAmount: number; quantity: number }[]
}
```

**Correct: import from @repo/api/schemas**

```typescript
import {
  type DocumentCreatePayload,
  documentCreatePayloadSchema,
} from '@repo/api/schemas'
```

**Incorrect: parallel expense/income hooks with identical logic**

```typescript
// use-expenses.ts and use-incomes.ts — same useQuery, different orpc path only
```

**Correct: shared hook factory or config-driven feature hook**

```typescript
import type { DocumentListResponse } from '@repo/api/schemas'
import { orpcClient } from '@/shared/lib/orpc/orpc-client'

const clients = { expense: orpcClient.expenses, income: orpcClient.incomes } as const
```

Put UI-only helpers (totals, default values, `RecordKind`) in `features/<slice>/model/`, not in `entities/`.

Reference: `packages/api`, `.agents/FSD.md`, `AGENTS.md` (Wealth monorepo section).
