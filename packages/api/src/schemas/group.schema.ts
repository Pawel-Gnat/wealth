import { z } from "zod";
import { apiPayload } from "./common.schema";
import { documentSchema } from "./document.schema";
import { userSchema } from "./user.schema";

export const GROUP_BUDGET_CREATED_MESSAGE = "group_budget_created" as const;

export const budgetMemberRoleSchema = z.enum(["owner", "member"]);

export const budgetMemberStatusSchema = z.enum(["active", "pending"]);

export const budgetMemberSchema = userSchema.extend({
	role: budgetMemberRoleSchema,
	status: budgetMemberStatusSchema,
});

export const groupBudgetSchema = z.object({
	id: z.string(),
	title: z.string(),
	ownerId: z.string(),
	members: z.array(budgetMemberSchema),
	expenses: z.array(documentSchema),
	incomes: z.array(documentSchema),
});

export const groupBudgetCreatePayloadSchema = z.object({
	title: z.string().trim().min(1, "form:title.required"),
	memberIds: z.array(z.string().min(1)),
});

export const groupBudgetCreateResponseDataSchema = z.object({
	message: z.literal(GROUP_BUDGET_CREATED_MESSAGE),
});

export const groupBudgetCreateResponseSchema = apiPayload(
	groupBudgetCreateResponseDataSchema,
);
