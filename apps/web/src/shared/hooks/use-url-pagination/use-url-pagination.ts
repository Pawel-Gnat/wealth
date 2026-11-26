import { pageSchema } from "@repo/api/schemas";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import {
	type FilterSchemas,
	type FilterValues,
	parseUrlParams,
	schemaKeys,
	serializeUrlParam,
	type UrlParamRelation,
} from "./utils/url-pagination";

const noRelations: readonly UrlParamRelation[] = [];

type WithoutPage<T> = "page" extends keyof T
	? string extends keyof T
		? T
		: never
	: T;

type FilterUpdates<T extends FilterSchemas<T>> = {
	[K in keyof FilterValues<T>]?: FilterValues<T>[K] | null;
};

type ParamUpdates<T extends FilterSchemas<T>> = {
	page?: number;
} & FilterUpdates<T>;

export const useUrlPagination = <const T extends FilterSchemas<T>>(
	schemas: WithoutPage<T>,
	relations: readonly UrlParamRelation[] = noRelations,
) => {
	const filterSchemas: T = schemas;
	const [searchParams, setSearchParams] = useSearchParams();

	const { page, filters } = parseUrlParams(
		searchParams,
		filterSchemas,
		relations,
	);

	useEffect(() => {
		const current = searchParams.toString();

		setSearchParams(
			(prev) => {
				if (prev.toString() !== current) return prev;

				const next = parseUrlParams(prev, filterSchemas, relations).normalized;

				if (prev.toString() === next.toString()) return prev;

				return next;
			},
			{ replace: true },
		);
	}, [filterSchemas, relations, searchParams, setSearchParams]);

	const setParams = (values: ParamUpdates<T>) => {
		const updates: Array<[string, string | null]> = [];

		if (values.page !== undefined) {
			const result = pageSchema.safeParse(values.page);

			if (!result.success) return;

			updates.push(["page", result.data === 1 ? null : String(result.data)]);
		}

		for (const key of schemaKeys(filterSchemas)) {
			if (!Object.hasOwn(values, key)) continue;

			const value = values[key];

			if (value === null) {
				updates.push([key, null]);
				continue;
			}

			const filter = filterSchemas[key];

			if (!filter) return;

			const serialized = filter.serialize(value as never);

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

			return params;
		});
	};

	const setPage = (page: number) => {
		const values: ParamUpdates<T> = {};
		values.page = page;
		setParams(values);
	};

	const setFilter = <K extends keyof T & string>(
		key: K,
		value: FilterValues<T>[K],
	) => {
		const values: Partial<FilterValues<T>> = {};
		values[key] = value;
		setParams(values);
	};

	const clearFilter = (key: keyof T & string) => {
		setSearchParams((prev) => serializeUrlParam(prev, key, null));
	};

	return { page, setPage, filters, setFilter, clearFilter, setParams };
};
