import { describe, expect, it } from "vitest";
import { getTrendBadgeVariant } from "./get-trend-badge-variant";

describe("getTrendBadgeVariant", () => {
	it("treats expense increases as negative", () => {
		expect(getTrendBadgeVariant("expenses", 10)).toBe("negative");
	});

	it("treats expense decreases as positive", () => {
		expect(getTrendBadgeVariant("expenses", -5)).toBe("positive");
	});

	it("treats income increases as positive", () => {
		expect(getTrendBadgeVariant("incomes", 8)).toBe("positive");
	});

	it("treats income decreases as negative", () => {
		expect(getTrendBadgeVariant("incomes", -2)).toBe("negative");
	});

	it("treats net balance like incomes", () => {
		expect(getTrendBadgeVariant("netBalance", 4)).toBe("positive");
		expect(getTrendBadgeVariant("netBalance", -4)).toBe("negative");
	});

	it("treats zero change as non-increase for expenses and incomes", () => {
		expect(getTrendBadgeVariant("expenses", 0)).toBe("positive");
		expect(getTrendBadgeVariant("incomes", 0)).toBe("negative");
	});
});
