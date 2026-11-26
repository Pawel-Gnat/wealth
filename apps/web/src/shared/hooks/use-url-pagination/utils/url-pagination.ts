import { pageSchema } from "@repo/api/schemas";
import type { z } from "zod";

export type UrlFilter<Value> = {
	parse: (raw: string) => Value | undefined;
	serialize: (value: Value) => string | undefined;
};

type AnyUrlFilter = {
	parse: (raw: string) => unknown;
	serialize: (value: never) => string | undefined;
};

export type FilterSchemas<T> = {
	[K in keyof T]: AnyUrlFilter;
};

type FilterOutput<Filter> = Filter extends {
	parse: (raw: string) => infer Value;
}
	? Exclude<Value, undefined>
	: never;

export type FilterValues<T extends FilterSchemas<T>> = {
	[K in keyof T]?: FilterOutput<T[K]>;
};

export type UrlParamRelation = (
	filters: Record<string, unknown>,
	params: URLSearchParams,
) => void;

type Scalar = string | number | boolean;

const readParsed = <Schema extends z.ZodType>(
	schema: Schema,
	value: unknown,
) => {
	const result = schema.safeParse(value);

	if (!result.success || result.data == null || result.data === "") return;

	return result.data as z.output<Schema>;
};

export const textFilter = <Schema extends z.ZodType<Scalar | undefined>>(
	schema: Schema,
): UrlFilter<z.output<Schema>> => ({
	parse: (raw) => readParsed(schema, raw),
	serialize: (value) => {
		const parsed = readParsed(schema, value);

		if (parsed == null) return;

		return String(parsed);
	},
});

export const listFilter = <
	Item extends Scalar,
	Schema extends z.ZodType<Item[] | undefined>,
>(
	schema: Schema,
): UrlFilter<z.output<Schema>> => ({
	parse: (raw) => {
		const items = raw
			.split(",")
			.map((item) => item.trim())
			.filter((item) => item.length > 0);

		if (items.length === 0) return;

		const parsed = readParsed(schema, items);

		if (!Array.isArray(parsed) || parsed.length === 0) return;

		return parsed;
	},
	serialize: (value) => {
		const parsed = readParsed(schema, value);

		if (!Array.isArray(parsed) || parsed.length === 0) return;

		return parsed.join(",");
	},
});

export const requireOrderedParams =
	(fromKey: string, toKey: string): UrlParamRelation =>
	(filters, params) => {
		const from = params.get(fromKey);
		const to = params.get(toKey);
		const incomplete = Boolean(from) !== Boolean(to);
		const inverted = Boolean(from && to && from > to);

		if (!incomplete && !inverted) return;

		params.delete(fromKey);
		params.delete(toKey);
		delete filters[fromKey];
		delete filters[toKey];
	};

export const parseUrlParams = <T extends FilterSchemas<T>>(
	params: URLSearchParams,
	schemas: T,
	relations: readonly UrlParamRelation[] = [],
) => {
	const normalized = new URLSearchParams(params);
	const filters: FilterValues<T> = {};

	const rawPage = params.get("page");
	const parsedPage = pageSchema.safeParse(rawPage);

	const page = rawPage !== null && parsedPage.success ? parsedPage.data : 1;

	if (rawPage !== null && (page === 1 || !parsedPage.success)) {
		normalized.delete("page");
	}

	for (const key of Object.keys(schemas) as Array<keyof T & string>) {
		const value = params.get(key);

		if (value === null) continue;

		const parsed = schemas[key].parse(value);

		if (parsed === undefined) {
			normalized.delete(key);
			continue;
		}

		filters[key] = parsed as FilterValues<T>[typeof key];
	}

	for (const relate of relations) {
		relate(filters as Record<string, unknown>, normalized);
	}

	return { page, filters, normalized };
};
