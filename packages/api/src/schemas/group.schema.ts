import { z } from "zod";
import { userSchema } from "./user.schema";

export const budgetMemberRoleSchema = z.enum(["owner", "member"]);
export type BudgetMemberRole = z.infer<typeof budgetMemberRoleSchema>;

export const budgetMemberStatusSchema = z.enum(["active", "pending"]);
export type BudgetMemberStatus = z.infer<typeof budgetMemberStatusSchema>;

export const budgetMemberSchema = userSchema.extend({
	role: budgetMemberRoleSchema,
	status: budgetMemberStatusSchema,
});
export type BudgetMember = z.infer<typeof budgetMemberSchema>;

export const groupBudgetSchema = z.object({
	id: z.string(),
	title: z.string(),
	members: z.array(budgetMemberSchema),
});
export type GroupBudget = z.infer<typeof groupBudgetSchema>;
