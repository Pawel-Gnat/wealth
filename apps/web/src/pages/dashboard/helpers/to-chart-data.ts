import type { DashboardChartPoint } from "@repo/api/schemas";
import { toDate } from "./to-date";

export type DashboardChartDataPoint = {
	label: string;
	expensesCumulative: number;
	incomesCumulative: number;
};

export const toChartData = (
	points: DashboardChartPoint[],
	language: string,
): DashboardChartDataPoint[] =>
	points.map((point) => {
		const date = toDate(point.date);

		return {
			label: date.toLocaleDateString(language, {
				month: "short",
				day: "numeric",
			}),
			expensesCumulative: point.expensesCumulative,
			incomesCumulative: point.incomesCumulative,
		};
	});
