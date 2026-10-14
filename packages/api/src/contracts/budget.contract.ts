import { oc } from "@orpc/contract";
import {
	budgetCreatePayloadSchema,
	budgetCreateResponseSchema,
	budgetDeleteResponseSchema,
	budgetIdParamsSchema,
	budgetInviteMembersInputSchema,
	budgetInviteMembersResponseSchema,
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
