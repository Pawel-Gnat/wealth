import { z } from "zod";
import { userSchema } from "./user.schema";

export const budgetMemberRoleSchema = z.enum(["owner", "member"]);

export const budgetMemberStatusSchema = z.enum(["active", "pending"]);

export const budgetMemberSchema = userSchema.extend({
	role: budgetMemberRoleSchema,
	status: budgetMemberStatusSchema,
});

export const groupBudgetSchema = z.object({
	id: z.string(),
	title: z.string(),
	members: z.array(budgetMemberSchema),
});
