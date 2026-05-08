import { z } from "zod";
import { apiPaginatedPayload, apiPayload } from "./common.schema";

export const expenseDocumentListItemSchema = z.object({
	id: z.string(),
	date: z.date(),
	totalAmount: z.number(),
});
export type ExpenseDocumentListItem = z.infer<
	typeof expenseDocumentListItemSchema
>;

export const expenseDocumentListResponseSchema = apiPaginatedPayload(
	expenseDocumentListItemSchema,
);
export type ExpenseDocumentListResponse = z.infer<
	typeof expenseDocumentListResponseSchema
>;

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

export const documentCreatePayloadSchema = z.object({
	date: z.coerce.date(),
	lineItems: z.array(lineItemSchema),
});
export type DocumentCreatePayload = z.infer<typeof documentCreatePayloadSchema>;

export const documentCreateResponseDataSchema = z.object({
	message: z.literal("expense_created"),
});
export type DocumentCreateResponseData = z.infer<
	typeof documentCreateResponseDataSchema
>;

export const documentCreateResponseSchema = apiPayload(
	documentCreateResponseDataSchema,
);
export type DocumentCreateResponse = z.infer<
	typeof documentCreateResponseSchema
>;

export const documentUpdatePayloadSchema = documentCreatePayloadSchema.extend({
	id: z.string(),
});
export type DocumentUpdatePayload = z.infer<typeof documentUpdatePayloadSchema>;

export const documentUpdateResponseDataSchema = z.object({
	message: z.literal("expense_updated"),
});
export type DocumentUpdateResponseData = z.infer<
	typeof documentUpdateResponseDataSchema
>;

export const documentUpdateResponseSchema = apiPayload(
	documentUpdateResponseDataSchema,
);
export type DocumentUpdateResponse = z.infer<
	typeof documentUpdateResponseSchema
>;

export const documentDeletePayloadSchema = z.object({
	id: z.string(),
});
export type DocumentDeletePayload = z.infer<typeof documentDeletePayloadSchema>;

export const documentDeleteResponseDataSchema = z.object({
	message: z.literal("expense_deleted"),
});
export type DocumentDeleteResponseData = z.infer<
	typeof documentDeleteResponseDataSchema
>;

export const documentDeleteResponseSchema = apiPayload(
	documentDeleteResponseDataSchema,
);
export type DocumentDeleteResponse = z.infer<
	typeof documentDeleteResponseSchema
>;
