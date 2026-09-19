import type { z } from "zod";
import type {
	budgetMemberRoleSchema,
	budgetMemberSchema,
	budgetMemberStatusSchema,
	groupBudgetSchema,
} from "../schemas/group.schema";

export type BudgetMemberRole = z.infer<typeof budgetMemberRoleSchema>;
export type BudgetMemberStatus = z.infer<typeof budgetMemberStatusSchema>;
export type BudgetMember = z.infer<typeof budgetMemberSchema>;
export type GroupBudget = z.infer<typeof groupBudgetSchema>;
