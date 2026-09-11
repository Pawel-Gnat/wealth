import type { DashboardChartPoint } from "@repo/api/schemas";
import { AreaChart } from "./area-chart";
import { BarChart } from "./bar-chart";
import type { ChartType } from "./chart-toggle";

type CumulativeChartProps = {
	points: DashboardChartPoint[];
	type: ChartType;
};

export const CumulativeChart = ({ points, type }: CumulativeChartProps) => {
	if (type === "bar") {
		return <BarChart points={points} />;
	}

	return <AreaChart points={points} />;
};
