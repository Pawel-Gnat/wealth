import { z } from "zod";
import { apiPaginatedPayload, apiPayload } from "./common.schema";

export const EXPENSE_UPDATED_MESSAGE = "expense_updated";

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

export const documentUpsertPayloadSchema = z.object({
	id: z.string().optional(),
	date: z.coerce.date(),
	lineItems: z.array(lineItemSchema),
});
export type DocumentUpsertPayload = z.infer<typeof documentUpsertPayloadSchema>;

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

export const documentUpdateResponseDataSchema = z.object({
	message: z.literal(EXPENSE_UPDATED_MESSAGE),
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

export const documentGetPayloadSchema = z.object({
	id: z.string(),
});
export type DocumentGetPayload = z.infer<typeof documentGetPayloadSchema>;

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
