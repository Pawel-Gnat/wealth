import { z } from "zod";

export function apiPayload<T extends z.ZodType>(zodSchema: T) {
	return z.object({
		data: zodSchema,
	});
}
export type ApiResponse<T> = {
	data: T;
};

export function apiPaginatedPayload<T extends z.ZodType>(zodSchema: T) {
	return z.object({
		data: zodSchema,
		pagination: z.object({
			next: z.string().optional(),
		}),
	});
}
export type ApiPaginatedResponse<T> = ApiResponse<Array<T>> & {
	pagination: {
		next?: string;
	};
};
