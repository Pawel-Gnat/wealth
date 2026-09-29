import type { z } from "zod";
import type {
	documentCreatePayloadSchema,
	documentCreateResponseDataSchema,
	documentCreateResponseSchema,
	documentDeleteResponseDataSchema,
	documentDeleteResponseSchema,
	documentDetailsResponseSchema,
	documentKindSchema,
	documentListItemSchema,
	documentListResponseSchema,
	documentParamsSchema,
	documentSchema,
	documentUpdatePayloadSchema,
	documentUpdateResponseDataSchema,
	documentUpdateResponseSchema,
	lineItemSchema,
} from "../schemas/document.schema";

export type DocumentKind = z.infer<typeof documentKindSchema>;
export type DocumentListItem = z.infer<typeof documentListItemSchema>;
export type DocumentListResponse = z.infer<typeof documentListResponseSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type DocumentDetails = z.infer<typeof documentSchema>;
export type DocumentDetailsResponse = z.infer<
	typeof documentDetailsResponseSchema
>;
export type DocumentCreatePayload = z.infer<typeof documentCreatePayloadSchema>;
export type DocumentUpdatePayload = z.infer<typeof documentUpdatePayloadSchema>;
export type DocumentCreateResponseData = z.infer<
	typeof documentCreateResponseDataSchema
>;
export type DocumentCreateResponse = z.infer<
	typeof documentCreateResponseSchema
>;
export type DocumentUpdateResponseData = z.infer<
	typeof documentUpdateResponseDataSchema
>;
export type DocumentUpdateResponse = z.infer<
	typeof documentUpdateResponseSchema
>;
export type DocumentParams = z.infer<typeof documentParamsSchema>;
export type DocumentDeleteResponseData = z.infer<
	typeof documentDeleteResponseDataSchema
>;
export type DocumentDeleteResponse = z.infer<
	typeof documentDeleteResponseSchema
>;
