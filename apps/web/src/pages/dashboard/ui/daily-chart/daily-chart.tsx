import type { ChartDays } from "@repo/api/schemas";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart } from "recharts";
import { getChartConfig } from "@/pages/dashboard/helpers/get-chart-config";
import { getChartYAxisMax } from "@/pages/dashboard/helpers/get-chart-y-axis-max";
import { toChartData } from "@/pages/dashboard/helpers/to-chart-data";
import { useDashboardDailyChart } from "@/pages/dashboard/hooks/use-dashboard-daily-chart";
import { ChartState } from "../chart-state/chart-state";
import { DashboardChartAreaGradients } from "../dashboard-chart-area-gradients";
import { DashboardChartCard } from "../dashboard-chart-card";
import { DashboardChartGridAxes } from "../dashboard-chart-grid-axes";
import { DashboardChartTooltip } from "../dashboard-chart-tooltip";

type DailyChartProps = {
	days: ChartDays;
};

export const DailyChart = ({ days }: DailyChartProps) => {
	const gradientId = useId().replace(/:/g, "");
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useDashboardDailyChart({ days });
	const chartConfig = getChartConfig(t);
	const expensesGradientId = `fill-expenses-${gradientId}`;
	const incomesGradientId = `fill-incomes-${gradientId}`;
	const chartData = data ? toChartData(data.points, i18n.language) : [];
	const yAxisMax = getChartYAxisMax(chartData);

	return (
		<ChartState isLoading={isLoading} isError={isError} hasData={Boolean(data)}>
			<DashboardChartCard config={chartConfig}>
				<AreaChart accessibilityLayer data={chartData}>
					<DashboardChartAreaGradients
						expensesGradientId={expensesGradientId}
						incomesGradientId={incomesGradientId}
					/>
					<DashboardChartGridAxes
						yAxisMax={yAxisMax}
						language={i18n.language}
					/>
					<DashboardChartTooltip
						chartConfig={chartConfig}
						language={i18n.language}
					/>
					<Area
						type="monotone"
						dataKey="expenses"
						stroke="var(--color-expenses)"
						fill={`url(#${expensesGradientId})`}
						strokeWidth={2}
					/>
					<Area
						type="monotone"
						dataKey="incomes"
						stroke="var(--color-incomes)"
						fill={`url(#${incomesGradientId})`}
						strokeWidth={2}
					/>
				</AreaChart>
			</DashboardChartCard>
		</ChartState>
	);
};
