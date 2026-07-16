import { describe, expect, it } from "vitest";
import { getChartYAxisMax, getChartYAxisTicks } from "./get-chart-y-axis-max";
import type { DashboardChartDataPoint } from "./to-chart-data";

const point = (
	expensesCumulative: number,
	incomesCumulative: number,
): DashboardChartDataPoint => ({
	label: "Jul 1",
	expensesCumulative,
	incomesCumulative,
});

describe("getChartYAxisMax", () => {
	it("takes the higher series value and rounds up to the next full 10", () => {
		expect(getChartYAxisMax([point(23, 34)])).toBe(40);
		expect(getChartYAxisMax([point(18, 22)])).toBe(30);
		expect(getChartYAxisMax([point(104, 122)])).toBe(130);
		expect(getChartYAxisMax([point(100, 50)])).toBe(100);
	});

	it("uses 10 when all values are zero", () => {
		expect(getChartYAxisMax([point(0, 0)])).toBe(10);
		expect(getChartYAxisMax([])).toBe(10);
	});
});

describe("getChartYAxisTicks", () => {
	it("returns ticks from 0 to max in steps of 10", () => {
		expect(getChartYAxisTicks(40)).toEqual([0, 10, 20, 30, 40]);
		expect(getChartYAxisTicks(30)).toEqual([0, 10, 20, 30]);
	});
});
