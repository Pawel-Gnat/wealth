import { oc } from "@orpc/contract";
import {
	groupBudgetCreatePayloadSchema,
	groupBudgetCreateResponseSchema,
} from "../schemas/group.schema";

export const createGroupBudgetContract = oc
	.route({ method: "POST", path: "/group-budgets" })
	.input(groupBudgetCreatePayloadSchema)
	.output(groupBudgetCreateResponseSchema);
