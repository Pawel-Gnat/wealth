import type { z } from "zod";
import type {
	storageGetParamsSchema,
	storageGetResponseDataSchema,
	storageGetResponseSchema,
} from "../schemas/storage.schema";

export type StorageGetParams = z.infer<typeof storageGetParamsSchema>;
export type StorageGetResponseData = z.infer<
	typeof storageGetResponseDataSchema
>;
export type StorageGetResponse = z.infer<typeof storageGetResponseSchema>;
