import { pageSchema } from "@repo/api/schemas";
import type { z } from "zod";

export type FilterSchemas<T> = {
	[K in keyof T]: z.ZodType;
};

export type FilterValues<T extends FilterSchemas<T>> = {
	[K in keyof T]?: z.output<T[K]>;
};

export type SchemaKey<T extends FilterSchemas<T>> = Extract<keyof T, string>;

export const schemaKeys = <T extends FilterSchemas<T>>(schemas: T) =>
	Object.keys(schemas) as SchemaKey<T>[];

const applyFilter = <T extends FilterSchemas<T>, K extends SchemaKey<T>>(
	filters: FilterValues<T>,
	schemas: T,
	key: K,
	raw: string,
) => {
	const schema = schemas[key];

	if (!schema) return false;

	const result = schema.safeParse(raw);

	if (!result.success) return false;

	filters[key] = result.data;

	return true;
};

export const filterToParam = <
	T extends FilterSchemas<T>,
	K extends SchemaKey<T>,
>(
	schemas: T,
	key: K,
	value: FilterValues<T>[K],
) => {
	const schema = schemas[key];

	if (!schema) return;

	const result = schema.safeParse(value);

	if (!result.success || result.data == null) return;

	return String(result.data);
};

export const parseUrlParams = <T extends FilterSchemas<T>>(
	params: URLSearchParams,
	schemas: T,
) => {
	const normalized = new URLSearchParams(params);
	const filters: FilterValues<T> = {};

	const rawPage = params.get("page");
	const parsedPage = pageSchema.safeParse(rawPage);

	const page = rawPage !== null && parsedPage.success ? parsedPage.data : 1;

	if (rawPage !== null && (page === 1 || !parsedPage.success)) {
		normalized.delete("page");
	}

	for (const key of schemaKeys(schemas)) {
		const value = params.get(key);

		if (value === null) continue;

		if (!applyFilter(filters, schemas, key, value)) {
			normalized.delete(key);
		}
	}

	if ("dateFrom" in schemas && "dateTo" in schemas) {
		const dateFrom = normalized.get("dateFrom");
		const dateTo = normalized.get("dateTo");
		const incomplete = Boolean(dateFrom) !== Boolean(dateTo);
		const inverted = Boolean(dateFrom && dateTo && dateFrom > dateTo);

		if (incomplete || inverted) {
			normalized.delete("dateFrom");
			normalized.delete("dateTo");

			const rangedFilters = filters as {
				dateFrom?: string;
				dateTo?: string;
			};

			delete rangedFilters.dateFrom;
			delete rangedFilters.dateTo;
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
