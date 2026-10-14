import { z } from "zod";
import { apiPayload } from "./common.schema";
import { recordSchema } from "./record.schema";
import { userSchema } from "./user.schema";

export const BUDGET_CREATED_MESSAGE = "budget_created" as const;
export const BUDGET_UPDATED_MESSAGE = "budget_updated" as const;
export const BUDGET_MEMBERS_INVITED_MESSAGE = "budget_members_invited" as const;
export const BUDGET_DELETED_MESSAGE = "budget_deleted" as const;
export const BUDGET_LEFT_MESSAGE = "budget_left" as const;
export const BUDGET_TITLE_MAX_LENGTH = 80;
export const BUDGET_MEMBER_IDS_MAX = 25;

const uniqueMemberIds = (memberIds: string[]) =>
	new Set(memberIds).size === memberIds.length;

export const budgetTitleSchema = z
	.string()
	.trim()
	.min(1, "form:title.required")
	.max(BUDGET_TITLE_MAX_LENGTH, "form:title.max");

export const budgetMemberIdsSchema = z
	.array(z.string().min(1))
	.max(BUDGET_MEMBER_IDS_MAX, "form:member-ids.max")
	.refine(uniqueMemberIds, {
		message: "form:member-ids.unique",
	});

export const budgetInviteMemberIdsSchema = z
	.array(z.string().min(1))
	.min(1, "form:member-ids.min")
	.max(BUDGET_MEMBER_IDS_MAX, "form:member-ids.max")
	.refine(uniqueMemberIds, {
		message: "form:member-ids.unique",
	});

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

export const budgetIdParamsSchema = z.object({
	id: z.string().min(1),
});

export const budgetCreatePayloadSchema = z.object({
	title: budgetTitleSchema,
	memberIds: budgetMemberIdsSchema,
});

export const budgetCreateResponseDataSchema = z.object({
	message: z.literal(BUDGET_CREATED_MESSAGE),
});

export const budgetCreateResponseSchema = apiPayload(
	budgetCreateResponseDataSchema,
);

export const budgetUpdatePayloadSchema = z.object({
	title: budgetTitleSchema,
});

export const budgetUpdateInputSchema = budgetUpdatePayloadSchema.extend({
	id: budgetIdParamsSchema.shape.id,
});

export const budgetUpdateResponseDataSchema = z.object({
	message: z.literal(BUDGET_UPDATED_MESSAGE),
});

export const budgetUpdateResponseSchema = apiPayload(
	budgetUpdateResponseDataSchema,
);

export const budgetInviteMembersPayloadSchema = z.object({
	memberIds: budgetInviteMemberIdsSchema,
});

export const budgetInviteMembersInputSchema =
	budgetInviteMembersPayloadSchema.extend({
		id: budgetIdParamsSchema.shape.id,
	});

export const budgetInviteMembersResponseDataSchema = z.object({
	message: z.literal(BUDGET_MEMBERS_INVITED_MESSAGE),
});

export const budgetInviteMembersResponseSchema = apiPayload(
	budgetInviteMembersResponseDataSchema,
);

export const budgetDeleteResponseDataSchema = z.object({
	message: z.literal(BUDGET_DELETED_MESSAGE),
});

export const budgetDeleteResponseSchema = apiPayload(
	budgetDeleteResponseDataSchema,
);

export const budgetLeaveResponseDataSchema = z.object({
	message: z.literal(BUDGET_LEFT_MESSAGE),
});

export const budgetLeaveResponseSchema = apiPayload(
	budgetLeaveResponseDataSchema,
);
