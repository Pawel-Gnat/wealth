import { z } from "zod";
import { apiPaginatedPayload } from "./common.schema";

export const expenseDocumentListItemSchema = z.object({
	slug: z.string(),
	totalAmount: z.number(),
	createdAt: z.string(),
	updatedAt: z.string(),
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
