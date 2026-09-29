import { z } from "zod";
import { apiPaginatedPayload, apiPayload } from "./common.schema";

export const DOCUMENT_CREATED_MESSAGE = "document_created" as const;
export const DOCUMENT_UPDATED_MESSAGE = "document_updated" as const;
export const DOCUMENT_DELETED_MESSAGE = "document_deleted" as const;

export const documentKinds = ["expense", "income"] as const;

export const documentKindSchema = z.enum(documentKinds);

export const documentListItemSchema = z.object({
	id: z.string(),
	date: z.date(),
	totalAmount: z.number(),
});

export const documentListResponseSchema = apiPaginatedPayload(
	documentListItemSchema,
);

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

export const documentSchema = z.object({
	id: z.string(),
	date: z.date(),
	totalAmount: z.number(),
	lineItems: z.array(lineItemSchema),
});

export const documentDetailsResponseSchema = apiPayload(documentSchema);

export const documentCreatePayloadSchema = z.object({
	date: z.coerce.date(),
	lineItems: z.array(lineItemSchema.omit({ id: true })),
});

export const documentUpdatePayloadSchema = documentCreatePayloadSchema.extend({
	id: z.string(),
});

export const documentListParamsSchema = z.object({
	kind: documentKindSchema,
});

export const documentCreateInputSchema = documentCreatePayloadSchema.extend({
	kind: documentKindSchema,
});

export const documentUpdateInputSchema = documentUpdatePayloadSchema.extend({
	kind: documentKindSchema,
});

export const documentCreateResponseDataSchema = z.object({
	message: z.literal(DOCUMENT_CREATED_MESSAGE),
});

export const documentCreateResponseSchema = apiPayload(
	documentCreateResponseDataSchema,
);

export const documentUpdateResponseDataSchema = z.object({
	message: z.literal(DOCUMENT_UPDATED_MESSAGE),
});

export const documentUpdateResponseSchema = apiPayload(
	documentUpdateResponseDataSchema,
);

export const documentParamsSchema = z.object({
	id: z.string(),
	kind: documentKindSchema,
});

export const documentDeleteResponseDataSchema = z.object({
	message: z.literal(DOCUMENT_DELETED_MESSAGE),
});

export const documentDeleteResponseSchema = apiPayload(
	documentDeleteResponseDataSchema,
);
