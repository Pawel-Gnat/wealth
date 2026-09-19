import type { DashboardChartPoint } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Bar, BarChart as BarChartUI } from "recharts";
import { ChartContainer } from "@/shared/components";
import { getChartConfig } from "../../helpers/get-chart-config";
import { getChartYAxisMax } from "../../helpers/get-chart-y-axis-max";
import { toChartData } from "../../helpers/to-chart-data";
import { ChartGridAxes } from "./chart-grid-axes";
import { ChartTooltip } from "./chart-tooltip";

type BarChartProps = {
	points: DashboardChartPoint[];
};

export const BarChart = ({ points }: BarChartProps) => {
	const { t, i18n } = useTranslation();
	const chartConfig = getChartConfig(t);
	const chartData = points ? toChartData(points, i18n.language) : [];
	const yAxisMax = getChartYAxisMax(chartData);

	return (
		<ChartContainer
			config={chartConfig}
			className="w-full max-h-80 aspect-video"
		>
			<BarChartUI accessibilityLayer data={chartData}>
				<ChartGridAxes yAxisMax={yAxisMax} language={i18n.language} />
				<ChartTooltip chartConfig={chartConfig} language={i18n.language} />
				<Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
				<Bar dataKey="incomes" fill="var(--color-incomes)" radius={4} />
			</BarChartUI>
		</ChartContainer>
	);
};
