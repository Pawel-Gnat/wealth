import { pageSchema } from "@repo/api/schemas";
import type { z } from "zod";

export type FilterSchemas = Record<string, z.ZodType>;

export type FilterValues<T extends FilterSchemas> = {
	[K in keyof T]?: z.output<T[K]>;
};

export const parseUrlParams = <T extends FilterSchemas>(
	params: URLSearchParams,
	schemas: T,
) => {
	const normalized = new URLSearchParams(params);
	const filters = {} as FilterValues<T>;

	const rawPage = params.get("page");
	const parsedPage = pageSchema.safeParse(rawPage);

	const page = rawPage !== null && parsedPage.success ? parsedPage.data : 1;

	if (rawPage !== null && (page === 1 || !parsedPage.success)) {
		normalized.delete("page");
	}

	for (const key of Object.keys(schemas) as Array<keyof T & string>) {
		const value = params.get(key);

		if (value === null) continue;

		const schema = schemas[key];

		if (!schema) continue;

		const result = schema.safeParse(value);

		if (result.success) {
			filters[key] = result.data as FilterValues<T>[typeof key];
		} else {
			normalized.delete(key);
		}
	}

	return { page, filters, normalized };
};

export const serializeUrlParam = (
	params: URLSearchParams,
	key: string,
	value: string | null,
): URLSearchParams => {
	const next = new URLSearchParams(params);

	if (value === null) {
		next.delete(key);
	} else {
		next.set(key, value);
	}

	return next;
};
