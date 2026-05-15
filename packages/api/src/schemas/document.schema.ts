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
export type DocumentListItem = z.infer<typeof documentListItemSchema>;

export const documentListResponseSchema = apiPaginatedPayload(
	documentListItemSchema,
);
export type DocumentListResponse = z.infer<typeof documentListResponseSchema>;

export const lineItemSchema = z.object({
	title: z.string().trim().min(1, "form:expense-line-item.required"),
	quantity: z
		.number({ error: "form:quantity.invalid" })
		.min(1, "form:quantity.min"),
	singleAmount: z
		.number({ error: "form:single-amount.invalid" })
		.min(0.01, "form:single-amount.min"),
});
export type LineItem = z.infer<typeof lineItemSchema>;

export const documentSchema = z.object({
	id: z.string(),
	date: z.date(),
	totalAmount: z.number(),
	lineItems: z.array(lineItemSchema),
});
export type DocumentDetails = z.infer<typeof documentSchema>;

export const documentDetailsResponseSchema = apiPayload(documentSchema);
export type DocumentDetailsResponse = z.infer<
	typeof documentDetailsResponseSchema
>;

export const documentCreatePayloadSchema = z.object({
	date: z.coerce.date(),
	lineItems: z.array(lineItemSchema),
});
export type DocumentCreatePayload = z.infer<typeof documentCreatePayloadSchema>;

export const documentUpdatePayloadSchema = documentCreatePayloadSchema.extend({
	id: z.string(),
});
export type DocumentUpdatePayload = z.infer<typeof documentUpdatePayloadSchema>;

export const expenseDocumentCreateResponseDataSchema = z.object({
	message: z.literal(EXPENSE_CREATED_MESSAGE),
});
export type ExpenseDocumentCreateResponseData = z.infer<
	typeof expenseDocumentCreateResponseDataSchema
>;

export const expenseDocumentCreateResponseSchema = apiPayload(
	expenseDocumentCreateResponseDataSchema,
);
export type ExpenseDocumentCreateResponse = z.infer<
	typeof expenseDocumentCreateResponseSchema
>;

export const incomeDocumentCreateResponseDataSchema = z.object({
	message: z.literal(INCOME_CREATED_MESSAGE),
});
export type IncomeDocumentCreateResponseData = z.infer<
	typeof incomeDocumentCreateResponseDataSchema
>;

export const incomeDocumentCreateResponseSchema = apiPayload(
	incomeDocumentCreateResponseDataSchema,
);
export type IncomeDocumentCreateResponse = z.infer<
	typeof incomeDocumentCreateResponseSchema
>;

export const expenseDocumentUpdateResponseDataSchema = z.object({
	message: z.literal(EXPENSE_UPDATED_MESSAGE),
});
export type ExpenseDocumentUpdateResponseData = z.infer<
	typeof expenseDocumentUpdateResponseDataSchema
>;

export const expenseDocumentUpdateResponseSchema = apiPayload(
	expenseDocumentUpdateResponseDataSchema,
);
export type ExpenseDocumentUpdateResponse = z.infer<
	typeof expenseDocumentUpdateResponseSchema
>;

export const incomeDocumentUpdateResponseDataSchema = z.object({
	message: z.literal(INCOME_UPDATED_MESSAGE),
});
export type IncomeDocumentUpdateResponseData = z.infer<
	typeof incomeDocumentUpdateResponseDataSchema
>;

export const incomeDocumentUpdateResponseSchema = apiPayload(
	incomeDocumentUpdateResponseDataSchema,
);
export type IncomeDocumentUpdateResponse = z.infer<
	typeof incomeDocumentUpdateResponseSchema
>;

export const documentGetPayloadSchema = z.object({
	id: z.string(),
});
export type DocumentGetPayload = z.infer<typeof documentGetPayloadSchema>;

export const expenseDocumentDeleteResponseDataSchema = z.object({
	message: z.literal(EXPENSE_DELETED_MESSAGE),
});
export type ExpenseDocumentDeleteResponseData = z.infer<
	typeof expenseDocumentDeleteResponseDataSchema
>;

export const expenseDocumentDeleteResponseSchema = apiPayload(
	expenseDocumentDeleteResponseDataSchema,
);
export type ExpenseDocumentDeleteResponse = z.infer<
	typeof expenseDocumentDeleteResponseSchema
>;

export const incomeDocumentDeleteResponseDataSchema = z.object({
	message: z.literal(INCOME_DELETED_MESSAGE),
});
export type IncomeDocumentDeleteResponseData = z.infer<
	typeof incomeDocumentDeleteResponseDataSchema
>;

export const incomeDocumentDeleteResponseSchema = apiPayload(
	incomeDocumentDeleteResponseDataSchema,
);
export type IncomeDocumentDeleteResponse = z.infer<
	typeof incomeDocumentDeleteResponseSchema
>;
