import { z } from "zod";

export const pageSchema = z.coerce.number().int().positive();

export function apiPayload<T extends z.ZodType>(zodSchema: T) {
	return z.object({
		data: zodSchema,
	});
}

export function apiCursorPaginatedPayload<T extends z.ZodType>(zodSchema: T) {
	return z.object({
		data: z.array(zodSchema),
		pagination: z.object({
			next: z.string().optional(),
		}),
	});
}

export function apiOffsetPaginatedPayload<T extends z.ZodType>(zodSchema: T) {
	return z.object({
		data: z.array(zodSchema),
		pagination: z.object({
			page: z.number().int().positive(),
			totalPages: z.number().int().nonnegative(),
			hasNextPage: z.boolean(),
			hasPreviousPage: z.boolean(),
		}),
	});
}
