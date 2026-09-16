import type { DashboardChartPoint } from "@repo/api/types";
import { toDate } from "./to-date";

export type DashboardChartDataPoint = {
	label: string;
	expenses: number;
	incomes: number;
};

export const getChartCardPoints = (
	points: DashboardChartPoint[] | undefined,
): DashboardChartPoint[] | undefined => {
	if (points == null) {
		return points;
	}

	const hasActivity = points.some(
		(point) => point.expenses !== 0 || point.incomes !== 0,
	);

	return hasActivity ? points : [];
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
			expenses: point.expenses,
			incomes: point.incomes,
		};
	});
