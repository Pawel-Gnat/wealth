import { describe, expect, it } from "vitest";
import { toChartData } from "./to-chart-data";
import { toDate } from "./to-date";

describe("toDate", () => {
	it("returns the same Date instance when already a Date", () => {
		const date = new Date("2024-07-15T00:00:00.000Z");

		expect(toDate(date)).toBe(date);
	});

	it("parses ISO strings into Date", () => {
		const result = toDate("2024-07-15T00:00:00.000Z");

		expect(result).toBeInstanceOf(Date);
		expect(result.toISOString()).toBe("2024-07-15T00:00:00.000Z");
	});
});

describe("toChartData", () => {
	it("maps API points to chart rows with localized labels", () => {
		const result = toChartData(
			[
				{
					date: new Date("2024-07-01T00:00:00.000Z"),
					expensesCumulative: 100,
					incomesCumulative: 50,
				},
				{
					date: new Date("2024-07-02T00:00:00.000Z"),
					expensesCumulative: 150,
					incomesCumulative: 50,
				},
			],
			"en-US",
		);

		expect(result).toEqual([
			{
				label: new Date("2024-07-01T00:00:00.000Z").toLocaleDateString(
					"en-US",
					{ month: "short", day: "numeric" },
				),
				expensesCumulative: 100,
				incomesCumulative: 50,
			},
			{
				label: new Date("2024-07-02T00:00:00.000Z").toLocaleDateString(
					"en-US",
					{ month: "short", day: "numeric" },
				),
				expensesCumulative: 150,
				incomesCumulative: 50,
			},
		]);
	});

	it("returns an empty array for empty points", () => {
		expect(toChartData([], "en")).toEqual([]);
	});
});
