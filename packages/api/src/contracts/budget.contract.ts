import { oc } from "@orpc/contract";
import {
	budgetCreatePayloadSchema,
	budgetCreateResponseSchema,
	budgetDocumentsParamsSchema,
	budgetDocumentsResponseSchema,
	budgetInvitesResponseSchema,
	budgetListResponseSchema,
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

export const listBudgetDocumentsContract = oc
	.route({ method: "GET", path: "/budgets/{id}/documents" })
	.input(budgetDocumentsParamsSchema)
	.output(budgetDocumentsResponseSchema);
