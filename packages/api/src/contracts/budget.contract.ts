import { oc } from "@orpc/contract";
import {
	budgetCancelInviteInputSchema,
	budgetCreatePayloadSchema,
	budgetCreateResponseSchema,
	budgetDeleteResponseSchema,
	budgetIdParamsSchema,
	budgetInviteAcceptedResponseSchema,
	budgetInviteCancelledResponseSchema,
	budgetInviteMembersInputSchema,
	budgetInviteMembersResponseSchema,
	budgetInviteRejectedResponseSchema,
	budgetInvitesResponseSchema,
	budgetLeaveResponseSchema,
	budgetListResponseSchema,
	budgetUpdateInputSchema,
	budgetUpdateResponseSchema,
} from "../schemas/budget.schema";

export const listBudgetsContract = oc
	.route({ method: "GET", path: "/budgets" })
	.output(budgetListResponseSchema);

export const listBudgetInvitesContract = oc
	.route({ method: "GET", path: "/budgets/invites" })
	.output(budgetInvitesResponseSchema);

export const createBudgetContract = oc
	.route({ method: "POST", path: "/budgets" })
	.input(budgetCreatePayloadSchema)
	.output(budgetCreateResponseSchema);

export const updateBudgetContract = oc
	.route({ method: "PUT", path: "/budgets/{id}" })
	.input(budgetUpdateInputSchema)
	.output(budgetUpdateResponseSchema);

export const inviteBudgetMembersContract = oc
	.route({ method: "POST", path: "/budgets/{id}/members" })
	.input(budgetInviteMembersInputSchema)
	.output(budgetInviteMembersResponseSchema);

export const deleteBudgetContract = oc
	.route({ method: "DELETE", path: "/budgets/{id}" })
	.input(budgetIdParamsSchema)
	.output(budgetDeleteResponseSchema);

export const leaveBudgetContract = oc
	.route({ method: "DELETE", path: "/budgets/{id}/membership" })
	.input(budgetIdParamsSchema)
	.output(budgetLeaveResponseSchema);

export const acceptBudgetInviteContract = oc
	.route({ method: "POST", path: "/budgets/{id}/invites/accept" })
	.input(budgetIdParamsSchema)
	.output(budgetInviteAcceptedResponseSchema);

export const rejectBudgetInviteContract = oc
	.route({ method: "DELETE", path: "/budgets/{id}/invites/reject" })
	.input(budgetIdParamsSchema)
	.output(budgetInviteRejectedResponseSchema);

export const cancelBudgetInviteContract = oc
	.route({ method: "DELETE", path: "/budgets/{id}/invites/{userId}" })
	.input(budgetCancelInviteInputSchema)
	.output(budgetInviteCancelledResponseSchema);
