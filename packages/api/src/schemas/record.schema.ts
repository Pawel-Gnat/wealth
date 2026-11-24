import { z } from "zod";
import { DEFAULT_PAGE_SIZE } from "../constants/pagination.constant";
import { isPageSize } from "../helpers/is-page-size.helper";
import {
	apiOffsetPaginatedPayload,
	apiPayload,
	pageSchema,
} from "./common.schema";
import { userSchema } from "./user.schema";

export const RECORD_CREATED_MESSAGE = "record_created" as const;
export const RECORD_UPDATED_MESSAGE = "record_updated" as const;
export const RECORD_DELETED_MESSAGE = "record_deleted" as const;

export const recordTypes = ["expense", "income"] as const;

export const recordTypeSchema = z.enum(recordTypes);

export const lineItemSchema = z.object({
	id: z.string(),
	title: z.string().trim().min(1, "form:line-item.required"),
	quantity: z
		.number({ error: "form:quantity.invalid" })
		.int("form:quantity.integer")
		.min(1, "form:quantity.min"),
	singleAmount: z
		.number({ error: "form:single-amount.invalid" })
		.min(0.01, "form:single-amount.min"),
});

export const recordSchema = z.object({
	id: z.string(),
	date: z.date(),
	type: recordTypeSchema,
	totalAmount: z.number(),
	lineItems: z.array(lineItemSchema),
});

export const recordListItemSchema = recordSchema
	.omit({
		lineItems: true,
	})
	.extend({
		owner: userSchema.optional(),
	});

export const recordListResponseSchema =
	apiOffsetPaginatedPayload(recordListItemSchema);

export const recordDetailsResponseSchema = apiPayload(recordSchema);

export const recordCreatePayloadSchema = z.object({
	date: z.coerce.date(),
	lineItems: z
		.array(lineItemSchema.omit({ id: true }))
		.min(1, "form:line-item.min"),
});

export const recordUpdatePayloadSchema = recordCreatePayloadSchema.extend({
	id: z.string(),
});

const pageSizeSchema = z.coerce.number().refine(isPageSize);

export const recordListParamsSchema = z.object({
	type: recordTypeSchema.optional(),
	budgetId: z.string().optional(),
	page: pageSchema.default(1),
	limit: pageSizeSchema.default(DEFAULT_PAGE_SIZE),
});

export const recordCreateInputSchema = recordCreatePayloadSchema.extend({
	type: recordTypeSchema,
	budgetId: z.string().optional(),
});

export const recordUpdateInputSchema = recordUpdatePayloadSchema.extend({
	type: recordTypeSchema,
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
	type: recordTypeSchema,
});

export const recordDeleteResponseDataSchema = z.object({
	message: z.literal(RECORD_DELETED_MESSAGE),
});

export const recordDeleteResponseSchema = apiPayload(
	recordDeleteResponseDataSchema,
);
