import type { DashboardChartPoint } from "@repo/api/schemas";
import { AreaChart } from "./area-chart";
import { BarChart } from "./bar-chart";
import type { ChartType } from "./chart-toggle";

type DailyChartProps = {
	points: DashboardChartPoint[];
	type: ChartType;
};

export const DailyChart = ({ points, type }: DailyChartProps) => {
	if (type === "bar") {
		return <BarChart points={points} />;
	}

	return <AreaChart points={points} />;
};
