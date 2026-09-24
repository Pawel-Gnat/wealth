import type { z } from "zod";
import type {
	budgetMemberRoleSchema,
	budgetMemberSchema,
	budgetMemberStatusSchema,
	groupBudgetCreatePayloadSchema,
	groupBudgetCreateResponseDataSchema,
	groupBudgetCreateResponseSchema,
	groupBudgetSchema,
} from "../schemas/group.schema";

export type BudgetMemberRole = z.infer<typeof budgetMemberRoleSchema>;
export type BudgetMemberStatus = z.infer<typeof budgetMemberStatusSchema>;
export type BudgetMember = z.infer<typeof budgetMemberSchema>;
export type GroupBudget = z.infer<typeof groupBudgetSchema>;
export type GroupBudgetCreatePayload = z.infer<
	typeof groupBudgetCreatePayloadSchema
>;
export type GroupBudgetCreateResponseData = z.infer<
	typeof groupBudgetCreateResponseDataSchema
>;
export type GroupBudgetCreateResponse = z.infer<
	typeof groupBudgetCreateResponseSchema
>;
