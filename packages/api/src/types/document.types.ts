import type { z } from "zod";
import type {
	documentCreatePayloadSchema,
	documentDetailsResponseSchema,
	documentListItemSchema,
	documentListResponseSchema,
	documentParamsSchema,
	documentSchema,
	documentUpdatePayloadSchema,
	expenseDocumentCreateResponseDataSchema,
	expenseDocumentCreateResponseSchema,
	expenseDocumentDeleteResponseDataSchema,
	expenseDocumentDeleteResponseSchema,
	expenseDocumentUpdateResponseDataSchema,
	expenseDocumentUpdateResponseSchema,
	incomeDocumentCreateResponseDataSchema,
	incomeDocumentCreateResponseSchema,
	incomeDocumentDeleteResponseDataSchema,
	incomeDocumentDeleteResponseSchema,
	incomeDocumentUpdateResponseDataSchema,
	incomeDocumentUpdateResponseSchema,
	lineItemSchema,
} from "../schemas/document.schema";

export type DocumentListItem = z.infer<typeof documentListItemSchema>;
export type DocumentListResponse = z.infer<typeof documentListResponseSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type DocumentDetails = z.infer<typeof documentSchema>;
export type DocumentDetailsResponse = z.infer<
	typeof documentDetailsResponseSchema
>;
export type DocumentCreatePayload = z.infer<typeof documentCreatePayloadSchema>;
export type DocumentUpdatePayload = z.infer<typeof documentUpdatePayloadSchema>;
export type ExpenseDocumentCreateResponseData = z.infer<
	typeof expenseDocumentCreateResponseDataSchema
>;
export type ExpenseDocumentCreateResponse = z.infer<
	typeof expenseDocumentCreateResponseSchema
>;
export type IncomeDocumentCreateResponseData = z.infer<
	typeof incomeDocumentCreateResponseDataSchema
>;
export type IncomeDocumentCreateResponse = z.infer<
	typeof incomeDocumentCreateResponseSchema
>;
export type ExpenseDocumentUpdateResponseData = z.infer<
	typeof expenseDocumentUpdateResponseDataSchema
>;
export type ExpenseDocumentUpdateResponse = z.infer<
	typeof expenseDocumentUpdateResponseSchema
>;
export type IncomeDocumentUpdateResponseData = z.infer<
	typeof incomeDocumentUpdateResponseDataSchema
>;
export type IncomeDocumentUpdateResponse = z.infer<
	typeof incomeDocumentUpdateResponseSchema
>;
export type DocumentParams = z.infer<typeof documentParamsSchema>;
export type ExpenseDocumentDeleteResponseData = z.infer<
	typeof expenseDocumentDeleteResponseDataSchema
>;
export type ExpenseDocumentDeleteResponse = z.infer<
	typeof expenseDocumentDeleteResponseSchema
>;
export type IncomeDocumentDeleteResponseData = z.infer<
	typeof incomeDocumentDeleteResponseDataSchema
>;
export type IncomeDocumentDeleteResponse = z.infer<
	typeof incomeDocumentDeleteResponseSchema
>;
