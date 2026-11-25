import { recordListParamsSchema } from "@repo/api/schemas";
import { describe, expect, it } from "vitest";
import { parseUrlParams, serializeUrlParam } from "./url-pagination";

const schemas = {
	type: recordListParamsSchema.shape.type,
	budgetId: recordListParamsSchema.shape.budgetId,
	limit: recordListParamsSchema.shape.limit,
};

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

	it("removes a date range that is missing one bound or reversed", () => {
		const dateSchemas = {
			...schemas,
			dateFrom: recordListParamsSchema.shape.dateFrom,
			dateTo: recordListParamsSchema.shape.dateTo,
		};
		const partial = parseUrlParams(
			new URLSearchParams("dateFrom=2024-03-01&type=expense"),
			dateSchemas,
		);
		const reversed = parseUrlParams(
			new URLSearchParams("dateFrom=2024-03-31&dateTo=2024-03-01"),
			dateSchemas,
		);
		const complete = parseUrlParams(
			new URLSearchParams("dateFrom=2024-03-01&dateTo=2024-03-31"),
			dateSchemas,
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
