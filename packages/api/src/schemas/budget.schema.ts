import { z } from "zod";
import { apiPayload } from "./common.schema";
import { documentListItemSchema, documentSchema } from "./document.schema";
import { userSchema } from "./user.schema";

export const BUDGET_CREATED_MESSAGE = "budget_created" as const;

export const budgetMemberStatuses = ["active", "pending"] as const;

export const budgetMemberStatusSchema = z.enum(budgetMemberStatuses);

export const budgetMemberSchema = userSchema.extend({
	status: budgetMemberStatusSchema,
});

export const budgetSchema = z.object({
	id: z.string(),
	title: z.string(),
	ownerId: z.string(),
	members: z.array(budgetMemberSchema),
	expenses: z.array(documentSchema),
	incomes: z.array(documentSchema),
});

export const budgetListItemSchema = budgetSchema.pick({
	id: true,
	title: true,
	ownerId: true,
	members: true,
});

export const budgetListResponseSchema = apiPayload(
	z.array(budgetListItemSchema),
);

export const budgetCreatePayloadSchema = z.object({
	title: z.string().trim().min(1, "form:title.required"),
	memberIds: z
		.array(z.string().min(1))
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

export const budgetDocumentKindSchema = z.enum(["expense", "income"]);

export const budgetDocumentSchema = documentListItemSchema.extend({
	kind: budgetDocumentKindSchema,
});

export const budgetDocumentsParamsSchema = z.object({
	id: z.string(),
	kind: budgetDocumentKindSchema.optional(),
});

export const budgetDocumentsResponseSchema = apiPayload(
	z.array(budgetDocumentSchema),
);
