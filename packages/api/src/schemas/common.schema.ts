import { z } from "zod";

export function apiPayload<T extends z.ZodType>(zodSchema: T) {
	return z.object({
		data: zodSchema,
	});
}

export function apiPaginatedPayload<T extends z.ZodType>(zodSchema: T) {
	return z.object({
		data: z.array(zodSchema),
		pagination: z.object({
			next: z.string().optional(),
		}),
	});
}
