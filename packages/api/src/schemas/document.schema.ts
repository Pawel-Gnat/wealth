import { z } from "zod";
import { apiPaginatedPayload, apiPayload } from "./common.schema";

export const EXPENSE_CREATED_MESSAGE = "expense_created" as const;
export const INCOME_CREATED_MESSAGE = "income_created" as const;
export const EXPENSE_UPDATED_MESSAGE = "expense_updated" as const;
export const INCOME_UPDATED_MESSAGE = "income_updated" as const;
export const EXPENSE_DELETED_MESSAGE = "expense_deleted" as const;
export const INCOME_DELETED_MESSAGE = "income_deleted" as const;

export const documentListItemSchema = z.object({
	id: z.string(),
	date: z.date(),
	totalAmount: z.number(),
});

export const documentListResponseSchema = apiPaginatedPayload(
	documentListItemSchema,
);

export const lineItemSchema = z.object({
	id: z.string(),
	title: z.string().trim().min(1, "form:line-item.required"),
	quantity: z
		.number({ error: "form:quantity.invalid" })
		.min(1, "form:quantity.min"),
	singleAmount: z
		.number({ error: "form:single-amount.invalid" })
		.min(0.01, "form:single-amount.min"),
});

export const documentSchema = z.object({
	id: z.string(),
	date: z.date(),
	totalAmount: z.number(),
	lineItems: z.array(lineItemSchema),
});

export const documentDetailsResponseSchema = apiPayload(documentSchema);

export const documentCreatePayloadSchema = z.object({
	date: z.coerce.date(),
	lineItems: z.array(lineItemSchema.omit({ id: true })),
});

export const documentUpdatePayloadSchema = documentCreatePayloadSchema.extend({
	id: z.string(),
});

export const expenseDocumentCreateResponseDataSchema = z.object({
	message: z.literal(EXPENSE_CREATED_MESSAGE),
});

export const expenseDocumentCreateResponseSchema = apiPayload(
	expenseDocumentCreateResponseDataSchema,
);

export const incomeDocumentCreateResponseDataSchema = z.object({
	message: z.literal(INCOME_CREATED_MESSAGE),
});

export const incomeDocumentCreateResponseSchema = apiPayload(
	incomeDocumentCreateResponseDataSchema,
);

export const expenseDocumentUpdateResponseDataSchema = z.object({
	message: z.literal(EXPENSE_UPDATED_MESSAGE),
});

export const expenseDocumentUpdateResponseSchema = apiPayload(
	expenseDocumentUpdateResponseDataSchema,
);

export const incomeDocumentUpdateResponseDataSchema = z.object({
	message: z.literal(INCOME_UPDATED_MESSAGE),
});

export const incomeDocumentUpdateResponseSchema = apiPayload(
	incomeDocumentUpdateResponseDataSchema,
);

export const documentParamsSchema = z.object({
	id: z.string(),
});

export const expenseDocumentDeleteResponseDataSchema = z.object({
	message: z.literal(EXPENSE_DELETED_MESSAGE),
});

export const expenseDocumentDeleteResponseSchema = apiPayload(
	expenseDocumentDeleteResponseDataSchema,
);

export const incomeDocumentDeleteResponseDataSchema = z.object({
	message: z.literal(INCOME_DELETED_MESSAGE),
});

export const incomeDocumentDeleteResponseSchema = apiPayload(
	incomeDocumentDeleteResponseDataSchema,
);
