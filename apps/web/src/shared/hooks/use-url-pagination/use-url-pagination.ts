import { pageSchema } from "@repo/api/schemas";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import {
	type FilterSchemas,
	type FilterValues,
	parseUrlParams,
	serializeUrlParam,
} from "./utils/url-pagination";

export const useUrlPagination = <const T extends FilterSchemas>(
	schemas: T & { page?: never },
) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const { page, filters, normalized } = parseUrlParams(searchParams, schemas);

	const currentSearch = searchParams.toString();
	const normalizedSearch = normalized.toString();

	useEffect(() => {
		if (currentSearch === normalizedSearch) return;

		setSearchParams(normalizedSearch, { replace: true });
	}, [currentSearch, normalizedSearch, setSearchParams]);

	const setParams = (values: { page?: number } & Partial<FilterValues<T>>) => {
		const updates: Array<[string, string | null]> = [];

		if (values.page !== undefined) {
			const result = pageSchema.safeParse(values.page);

			if (!result.success) return;

			updates.push(["page", result.data === 1 ? null : String(result.data)]);
		}

		for (const key of Object.keys(schemas) as Array<keyof T & string>) {
			if (!Object.hasOwn(values, key)) continue;

			const schema = schemas[key];

			if (!schema) continue;

			const result = schema.safeParse(values[key]);

			if (!result.success || result.data == null) return;

			updates.push([key, String(result.data)]);
		}

		if (updates.length === 0) return;

		setSearchParams((prev) =>
			updates.reduce(
				(params, [key, value]) => serializeUrlParam(params, key, value),
				new URLSearchParams(prev),
			),
		);
	};

	const setPage = (value: number) => {
		const result = pageSchema.safeParse(value);

		if (!result.success) return;

		setSearchParams((prev) =>
			serializeUrlParam(
				prev,
				"page",
				result.data === 1 ? null : String(result.data),
			),
		);
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
