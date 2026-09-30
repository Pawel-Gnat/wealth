import { z } from "zod";
import { apiPayload } from "./common.schema";
import {
	recordKindSchema,
	recordListItemSchema,
	recordSchema,
} from "./record.schema";
import { userSchema } from "./user.schema";

export const BUDGET_CREATED_MESSAGE = "budget_created" as const;
export const BUDGET_TITLE_MAX_LENGTH = 80;
export const BUDGET_MEMBER_IDS_MAX = 25;

export const budgetMemberStatuses = ["active", "pending"] as const;

export const budgetMemberStatusSchema = z.enum(budgetMemberStatuses);

export const budgetMemberSchema = userSchema.extend({
	status: budgetMemberStatusSchema,
});

export const budgetSchema = z.object({
	id: z.string(),
	title: z.string(),
	owner: userSchema,
	members: z.array(budgetMemberSchema),
	expenses: z.array(recordSchema),
	incomes: z.array(recordSchema),
});

export const budgetListItemSchema = budgetSchema.pick({
	id: true,
	title: true,
	owner: true,
	members: true,
});

export const budgetListResponseSchema = apiPayload(
	z.array(budgetListItemSchema),
);

export const budgetInviteSchema = z.object({
	budget: budgetListItemSchema,
	invitee: budgetMemberSchema,
});

export const budgetInvitesResponseSchema = apiPayload(
	z.array(budgetInviteSchema),
);

export const budgetCreatePayloadSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "form:title.required")
		.max(BUDGET_TITLE_MAX_LENGTH, "form:title.max"),
	memberIds: z
		.array(z.string().min(1))
		.max(BUDGET_MEMBER_IDS_MAX, "form:member-ids.max")
		.refine((memberIds) => new Set(memberIds).size === memberIds.length, {
			message: "form:member-ids.unique",
		}),
});

export const budgetCreateResponseDataSchema = z.object({
	message: z.literal(BUDGET_CREATED_MESSAGE),
});

export const budgetCreateResponseSchema = apiPayload(
	budgetCreateResponseDataSchema,
);

export const budgetDocumentsParamsSchema = z.object({
	id: z.string(),
	kind: recordKindSchema.optional(),
});

export const budgetDocumentsResponseSchema = apiPayload(
	z.array(recordListItemSchema),
);
