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
