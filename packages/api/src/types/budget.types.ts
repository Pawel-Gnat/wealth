import type { z } from "zod";
import type {
	budgetCancelInviteInputSchema,
	budgetCreatePayloadSchema,
	budgetCreateResponseDataSchema,
	budgetCreateResponseSchema,
	budgetDeleteResponseDataSchema,
	budgetDeleteResponseSchema,
	budgetIdParamsSchema,
	budgetInviteAcceptedResponseSchema,
	budgetInviteCancelledResponseSchema,
	budgetInviteMembersInputSchema,
	budgetInviteMembersPayloadSchema,
	budgetInviteMembersResponseDataSchema,
	budgetInviteMembersResponseSchema,
	budgetInviteRejectedResponseSchema,
	budgetInviteSchema,
	budgetInvitesResponseSchema,
	budgetLeaveResponseDataSchema,
	budgetLeaveResponseSchema,
	budgetListItemSchema,
	budgetListResponseSchema,
	budgetMemberSchema,
	budgetMemberStatusSchema,
	budgetSchema,
	budgetUpdateInputSchema,
	budgetUpdatePayloadSchema,
	budgetUpdateResponseDataSchema,
	budgetUpdateResponseSchema,
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
export type BudgetIdParams = z.infer<typeof budgetIdParamsSchema>;
export type BudgetUpdatePayload = z.infer<typeof budgetUpdatePayloadSchema>;
export type BudgetUpdateInput = z.infer<typeof budgetUpdateInputSchema>;
export type BudgetUpdateResponseData = z.infer<
	typeof budgetUpdateResponseDataSchema
>;
export type BudgetUpdateResponse = z.infer<typeof budgetUpdateResponseSchema>;
export type BudgetInviteMembersPayload = z.infer<
	typeof budgetInviteMembersPayloadSchema
>;
export type BudgetInviteMembersInput = z.infer<
	typeof budgetInviteMembersInputSchema
>;
export type BudgetInviteMembersResponseData = z.infer<
	typeof budgetInviteMembersResponseDataSchema
>;
export type BudgetInviteMembersResponse = z.infer<
	typeof budgetInviteMembersResponseSchema
>;
export type BudgetDeleteResponseData = z.infer<
	typeof budgetDeleteResponseDataSchema
>;
export type BudgetDeleteResponse = z.infer<typeof budgetDeleteResponseSchema>;
export type BudgetLeaveResponseData = z.infer<
	typeof budgetLeaveResponseDataSchema
>;
export type BudgetLeaveResponse = z.infer<typeof budgetLeaveResponseSchema>;
export type BudgetCancelInviteInput = z.infer<
	typeof budgetCancelInviteInputSchema
>;
export type BudgetInviteAcceptedResponse = z.infer<
	typeof budgetInviteAcceptedResponseSchema
>;
export type BudgetInviteRejectedResponse = z.infer<
	typeof budgetInviteRejectedResponseSchema
>;
export type BudgetInviteCancelledResponse = z.infer<
	typeof budgetInviteCancelledResponseSchema
>;
