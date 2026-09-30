import { z } from "zod";
import { apiPaginatedPayload, apiPayload } from "./common.schema";

export const RECORD_CREATED_MESSAGE = "record_created" as const;
export const RECORD_UPDATED_MESSAGE = "record_updated" as const;
export const RECORD_DELETED_MESSAGE = "record_deleted" as const;

export const recordKinds = ["expense", "income"] as const;

export const recordKindSchema = z.enum(recordKinds);

export const lineItemSchema = z.object({
	id: z.string(),
	title: z.string().trim().min(1, "form:line-item.required"),
	quantity: z
		.number({ error: "form:quantity.invalid" })
		.min(1, "form:quantity.min"),
	singleAmount: z
		.number({ error: "form:single-amount.invalid" })
		.min(0.01, "form:single-amount.min"),
});

export const recordSchema = z.object({
	id: z.string(),
	date: z.date(),
	kind: recordKindSchema,
	totalAmount: z.number(),
	lineItems: z.array(lineItemSchema),
});

export const recordListItemSchema = recordSchema.omit({
	lineItems: true,
});

export const recordListResponseSchema =
	apiPaginatedPayload(recordListItemSchema);

export const recordDetailsResponseSchema = apiPayload(recordSchema);

export const recordCreatePayloadSchema = z.object({
	date: z.coerce.date(),
	lineItems: z.array(lineItemSchema.omit({ id: true })),
});

export const recordUpdatePayloadSchema = recordCreatePayloadSchema.extend({
	id: z.string(),
});

export const recordListParamsSchema = z.object({
	kind: recordKindSchema.optional(),
	budgetId: z.string().optional(),
});

export const recordCreateInputSchema = recordCreatePayloadSchema.extend({
	kind: recordKindSchema,
});

export const recordUpdateInputSchema = recordUpdatePayloadSchema.extend({
	kind: recordKindSchema,
});

export const recordCreateResponseDataSchema = z.object({
	message: z.literal(RECORD_CREATED_MESSAGE),
});

export const recordCreateResponseSchema = apiPayload(
	recordCreateResponseDataSchema,
);

export const recordUpdateResponseDataSchema = z.object({
	message: z.literal(RECORD_UPDATED_MESSAGE),
});

export const recordUpdateResponseSchema = apiPayload(
	recordUpdateResponseDataSchema,
);

export const recordGetParamsSchema = z.object({
	id: z.string(),
});

export const recordParamsSchema = z.object({
	id: z.string(),
	kind: recordKindSchema,
});

export const recordDeleteResponseDataSchema = z.object({
	message: z.literal(RECORD_DELETED_MESSAGE),
});

export const recordDeleteResponseSchema = apiPayload(
	recordDeleteResponseDataSchema,
);
