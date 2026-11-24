import type { z } from "zod";
import type {
	lineItemSchema,
	recordCreatePayloadSchema,
	recordCreateResponseDataSchema,
	recordCreateResponseSchema,
	recordDeleteResponseDataSchema,
	recordDeleteResponseSchema,
	recordDetailsResponseSchema,
	recordGetParamsSchema,
	recordListItemSchema,
	recordListResponseSchema,
	recordParamsSchema,
	recordSchema,
	recordTypeSchema,
	recordUpdatePayloadSchema,
	recordUpdateResponseDataSchema,
	recordUpdateResponseSchema,
} from "../schemas/record.schema";

export type RecordType = z.infer<typeof recordTypeSchema>;
export type RecordListItem = z.infer<typeof recordListItemSchema>;
export type RecordListResponse = z.infer<typeof recordListResponseSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type RecordDetails = z.infer<typeof recordSchema>;
export type RecordDetailsResponse = z.infer<typeof recordDetailsResponseSchema>;
export type RecordCreatePayload = z.infer<typeof recordCreatePayloadSchema>;
export type RecordUpdatePayload = z.infer<typeof recordUpdatePayloadSchema>;
export type RecordCreateResponseData = z.infer<
	typeof recordCreateResponseDataSchema
>;
export type RecordCreateResponse = z.infer<typeof recordCreateResponseSchema>;
export type RecordUpdateResponseData = z.infer<
	typeof recordUpdateResponseDataSchema
>;
export type RecordUpdateResponse = z.infer<typeof recordUpdateResponseSchema>;
export type RecordGetParams = z.infer<typeof recordGetParamsSchema>;
export type RecordParams = z.infer<typeof recordParamsSchema>;
export type RecordDeleteResponseData = z.infer<
	typeof recordDeleteResponseDataSchema
>;
export type RecordDeleteResponse = z.infer<typeof recordDeleteResponseSchema>;
