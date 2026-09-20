import { z } from "zod";
import { apiPayload } from "./common.schema";

export const storageGetParamsSchema = z.object({
	id: z.string(),
});

export const storageGetResponseDataSchema = z.object({
	url: z.string().min(1),
});

export const storageGetResponseSchema = apiPayload(
	storageGetResponseDataSchema,
);
