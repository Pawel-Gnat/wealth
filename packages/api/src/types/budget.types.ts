import type { z } from "zod";
import type {
	budgetCreatePayloadSchema,
	budgetCreateResponseDataSchema,
	budgetCreateResponseSchema,
	budgetDocumentsParamsSchema,
	budgetDocumentsResponseSchema,
	budgetInviteSchema,
	budgetInvitesResponseSchema,
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
export type BudgetInvite = z.infer<typeof budgetInviteSchema>;
export type BudgetInvitesResponse = z.infer<typeof budgetInvitesResponseSchema>;
export type BudgetCreatePayload = z.infer<typeof budgetCreatePayloadSchema>;
export type BudgetCreateResponseData = z.infer<
	typeof budgetCreateResponseDataSchema
>;
export type BudgetCreateResponse = z.infer<typeof budgetCreateResponseSchema>;
export type BudgetDocumentsParams = z.infer<typeof budgetDocumentsParamsSchema>;
export type BudgetDocumentsResponse = z.infer<
	typeof budgetDocumentsResponseSchema
>;
