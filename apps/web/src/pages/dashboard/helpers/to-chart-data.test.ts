import { describe, expect, it } from "vitest";
import { getChartCardPoints, toChartData } from "./to-chart-data";
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
					expenses: 100,
					incomes: 50,
				},
				{
					date: new Date("2024-07-02T00:00:00.000Z"),
					expenses: 150,
					incomes: 50,
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
				expenses: 100,
				incomes: 50,
			},
			{
				label: new Date("2024-07-02T00:00:00.000Z").toLocaleDateString(
					"en-US",
					{ month: "short", day: "numeric" },
				),
				expenses: 150,
				incomes: 50,
			},
		]);
	});

	it("returns an empty array for empty points", () => {
		expect(toChartData([], "en")).toEqual([]);
	});
});

describe("getChartCardPoints", () => {
	it("returns undefined when points are missing", () => {
		expect(getChartCardPoints(undefined)).toBeUndefined();
	});

	it("returns an empty array when every point is zero", () => {
		expect(
			getChartCardPoints([
				{
					date: new Date("2024-07-01T00:00:00.000Z"),
					expenses: 0,
					incomes: 0,
				},
			]),
		).toEqual([]);
	});

	it("returns the points when there is activity", () => {
		const points = [
			{
				date: new Date("2024-07-01T00:00:00.000Z"),
				expenses: 10,
				incomes: 0,
			},
		];

		expect(getChartCardPoints(points)).toBe(points);
	});
});
