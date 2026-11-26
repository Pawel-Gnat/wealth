import { recordListParamsSchema } from "@repo/api/schemas";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	listFilter,
	parseUrlParams,
	requireOrderedParams,
	serializeUrlParam,
	textFilter,
} from "./url-pagination";

const schemas = {
	type: textFilter(recordListParamsSchema.shape.type),
	budgetId: textFilter(recordListParamsSchema.shape.budgetId),
	limit: textFilter(recordListParamsSchema.shape.limit),
};

const dateSchemas = {
	...schemas,
	dateFrom: textFilter(recordListParamsSchema.shape.dateFrom),
	dateTo: textFilter(recordListParamsSchema.shape.dateTo),
};

const dateRelation = [requireOrderedParams("dateFrom", "dateTo")];

describe("parseUrlParams", () => {
	it("parses valid URL parameters", () => {
		const params = new URLSearchParams(
			"page=3&type=expense&budgetId=budget-1&limit=20",
		);

		const result = parseUrlParams(params, schemas);

		expect(result.page).toBe(3);
		expect(result.filters.type).toBe("expense");
		expect(result.filters.budgetId).toBe("budget-1");
		expect(result.filters.limit).toBe(20);
	});

	it("removes invalid parameters", () => {
		const params = new URLSearchParams("page=abc&type=unknown&limit=15");

		const result = parseUrlParams(params, schemas);

		expect(result.page).toBe(1);
		expect(result.filters).toEqual({});
		expect(result.normalized.toString()).toBe("");
	});

	it("keeps one date bound until a relation removes the pair", () => {
		const partial = parseUrlParams(
			new URLSearchParams("dateFrom=2024-03-01&type=expense"),
			dateSchemas,
		);

		expect(partial.filters.dateFrom).toBe("2024-03-01");
		expect(partial.normalized.toString()).toBe(
			"dateFrom=2024-03-01&type=expense",
		);
	});

	it("removes a date range that is missing one bound or reversed", () => {
		const partial = parseUrlParams(
			new URLSearchParams("dateFrom=2024-03-01&type=expense"),
			dateSchemas,
			dateRelation,
		);
		const reversed = parseUrlParams(
			new URLSearchParams("dateFrom=2024-03-31&dateTo=2024-03-01"),
			dateSchemas,
			dateRelation,
		);
		const complete = parseUrlParams(
			new URLSearchParams("dateFrom=2024-03-01&dateTo=2024-03-31"),
			dateSchemas,
			dateRelation,
		);

		expect(partial.filters.dateFrom).toBeUndefined();
		expect(partial.normalized.toString()).toBe("type=expense");
		expect(reversed.filters.dateFrom).toBeUndefined();
		expect(reversed.normalized.toString()).toBe("");
		expect(complete.filters).toMatchObject({
			dateFrom: "2024-03-01",
			dateTo: "2024-03-31",
		});
	});

	it("keeps valid filters when the page is invalid", () => {
		const params = new URLSearchParams("page=0&type=income&limit=30");

		const result = parseUrlParams(params, schemas);

		expect(result.page).toBe(1);
		expect(result.filters.type).toBe("income");
		expect(result.filters.limit).toBe(30);
		expect(result.normalized.toString()).toBe("type=income&limit=30");
	});

	it("parses and serializes a list from a comma separated value", () => {
		const colors = {
			colors: listFilter(z.array(z.string().min(2))),
		};
		const parsed = parseUrlParams(
			new URLSearchParams("colors=red,green"),
			colors,
		);
		const invalid = parseUrlParams(new URLSearchParams("colors=red,g"), colors);
		const empty = parseUrlParams(new URLSearchParams("colors=,"), colors);

		expect(parsed.filters.colors).toEqual(["red", "green"]);
		expect(colors.colors.serialize(["red", "green"])).toBe("red,green");
		expect(invalid.filters.colors).toBeUndefined();
		expect(invalid.normalized.toString()).toBe("");
		expect(empty.filters.colors).toBeUndefined();
		expect(empty.normalized.toString()).toBe("");
	});
});

describe("serializeUrlParam", () => {
	it("preserves valid parameters", () => {
		const params = new URLSearchParams("page=2&type=expense");

		const result = serializeUrlParam(params, "limit", "20");

		expect(result.get("page")).toBe("2");
		expect(result.get("type")).toBe("expense");
		expect(result.get("limit")).toBe("20");
	});
});
