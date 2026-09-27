import type { z } from "zod";
import type {
	budgetCreatePayloadSchema,
	budgetCreateResponseDataSchema,
	budgetCreateResponseSchema,
	budgetDocumentKindSchema,
	budgetDocumentSchema,
	budgetDocumentsParamsSchema,
	budgetDocumentsResponseSchema,
	budgetListItemSchema,
	budgetListResponseSchema,
	budgetMemberSchema,
	budgetMemberStatusSchema,
	budgetSchema,
} from "../schemas/budget.schema";

export type BudgetMemberStatus = z.infer<typeof budgetMemberStatusSchema>;
export type BudgetMember = z.infer<typeof budgetMemberSchema>;
export type Budget = z.infer<typeof budgetSchema>;
export type BudgetListItem = z.infer<typeof budgetListItemSchema>;
export type BudgetListResponse = z.infer<typeof budgetListResponseSchema>;
export type BudgetCreatePayload = z.infer<typeof budgetCreatePayloadSchema>;
export type BudgetCreateResponseData = z.infer<
	typeof budgetCreateResponseDataSchema
>;
export type BudgetCreateResponse = z.infer<typeof budgetCreateResponseSchema>;
export type BudgetDocumentKind = z.infer<typeof budgetDocumentKindSchema>;
export type BudgetDocument = z.infer<typeof budgetDocumentSchema>;
export type BudgetDocumentsParams = z.infer<typeof budgetDocumentsParamsSchema>;
export type BudgetDocumentsResponse = z.infer<
	typeof budgetDocumentsResponseSchema
>;
