import type { ChartDays } from "@repo/api/schemas";
import { useTranslation } from "react-i18next";
import { Line, LineChart } from "recharts";
import { getChartConfig } from "@/pages/dashboard/helpers/get-chart-config";
import { getChartYAxisMax } from "@/pages/dashboard/helpers/get-chart-y-axis-max";
import { toChartData } from "@/pages/dashboard/helpers/to-chart-data";
import { useDashboardCumulativeChart } from "@/pages/dashboard/hooks/use-dashboard-cumulative-chart";
import { ChartCard } from "./chart-card";
import { ChartGridAxes } from "./chart-grid-axes";
import { ChartState } from "./chart-state";
import { ChartTooltip } from "./chart-tooltip";

type CumulativeChartProps = {
	days: ChartDays;
};

export const CumulativeChart = ({ days }: CumulativeChartProps) => {
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useDashboardCumulativeChart({ days });
	const chartConfig = getChartConfig(t);
	const chartData = data ? toChartData(data.points, i18n.language) : [];
	const yAxisMax = getChartYAxisMax(chartData);

	return (
		<ChartState isLoading={isLoading} isError={isError} hasData={Boolean(data)}>
			<ChartCard config={chartConfig}>
				<LineChart accessibilityLayer data={chartData}>
					<ChartGridAxes yAxisMax={yAxisMax} language={i18n.language} />
					<ChartTooltip chartConfig={chartConfig} language={i18n.language} />
					<Line
						type="monotone"
						dataKey="expenses"
						stroke="var(--color-expenses)"
						strokeWidth={2}
						dot={false}
					/>
					<Line
						type="monotone"
						dataKey="incomes"
						stroke="var(--color-incomes)"
						strokeWidth={2}
						dot={false}
					/>
				</LineChart>
			</ChartCard>
		</ChartState>
	);
};
