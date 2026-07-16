import type { DashboardChartDataPoint } from "./to-chart-data";

export const getChartYAxisMax = (points: DashboardChartDataPoint[]) => {
	const maxValue = Math.max(
		0,
		...points.flatMap((point) => [
			point.expensesCumulative,
			point.incomesCumulative,
		]),
	);

	if (maxValue === 0) {
		return 10;
	}

	return Math.ceil(maxValue / 10) * 10;
};

export const getChartYAxisTicks = (yAxisMax: number) =>
	Array.from({ length: yAxisMax / 10 + 1 }, (_, index) => index * 10);
