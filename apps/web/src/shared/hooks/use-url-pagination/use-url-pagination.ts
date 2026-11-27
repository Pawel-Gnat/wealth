import { pageSchema } from "@repo/api/schemas";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import {
	type FilterSchemas,
	type FilterValues,
	parseUrlParams,
	type UrlParamRelation,
} from "./helpers/url-pagination";

const noRelations: readonly UrlParamRelation[] = [];

type FilterUpdates<T extends FilterSchemas<T>> = {
	[K in keyof FilterValues<T>]?: FilterValues<T>[K] | null;
};

type ParamUpdates<T extends FilterSchemas<T>> = {
	page?: number;
} & FilterUpdates<T>;

export const useUrlPagination = <const T extends FilterSchemas<T>>(
	schemas: T & { page?: never },
	relations: readonly UrlParamRelation[] = noRelations,
) => {
	const filterSchemas: T = schemas;
	const [searchParams, setSearchParams] = useSearchParams();

	const { page, filters, normalized } = parseUrlParams(
		searchParams,
		filterSchemas,
		relations,
	);

	const currentSearch = searchParams.toString();
	const normalizedSearch = normalized.toString();

	useEffect(() => {
		if (currentSearch === normalizedSearch) return;

		setSearchParams(normalizedSearch, { replace: true });
	}, [currentSearch, normalizedSearch, setSearchParams]);

	const setParams = (values: ParamUpdates<T>) => {
		const updates: Array<[string, string | null]> = [];

		if (values.page !== undefined) {
			const result = pageSchema.safeParse(values.page);

			if (!result.success) return;

			updates.push(["page", result.data === 1 ? null : String(result.data)]);
		}

		for (const key in filterSchemas) {
			if (!Object.hasOwn(values, key)) continue;

			const value = values[key];

			if (value === null) {
				updates.push([key, null]);
				continue;
			}

			const serialized = filterSchemas[key].serialize(value);

			if (serialized === undefined) return;

			updates.push([key, serialized]);
		}

		if (updates.length === 0) return;

		setSearchParams((prev) => {
			const params = new URLSearchParams(prev);

			for (const [key, value] of updates) {
				if (value === null) {
					params.delete(key);
				} else {
					params.set(key, value);
				}
			}

			return parseUrlParams(params, filterSchemas, relations).normalized;
		});
	};

	const setPage = (page: number) => {
		const values: ParamUpdates<T> = {};
		values.page = page;
		setParams(values);
	};

	const setFilter = <K extends keyof T & string>(
		key: K,
		value: NonNullable<FilterValues<T>[K]>,
	) => {
		const values: Partial<FilterValues<T>> = {};
		values[key] = value;
		setParams(values);
	};

	const clearFilter = (key: keyof T & string) => {
		const values: FilterUpdates<T> = {};
		values[key] = null;
		setParams(values);
	};

	return { page, setPage, filters, setFilter, clearFilter, setParams };
};
