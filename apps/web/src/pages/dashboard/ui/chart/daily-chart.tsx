import type { ChartDays } from "@repo/api/schemas";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart } from "recharts";
import { getChartConfig } from "../../helpers/get-chart-config";
import { getChartYAxisMax } from "../../helpers/get-chart-y-axis-max";
import { toChartData } from "../../helpers/to-chart-data";
import { useDashboardDailyChart } from "../../hooks/use-dashboard-daily-chart";
import { ChartAreaGradients } from "./chart-area-gradients";
import { ChartCard } from "./chart-card";
import { ChartGridAxes } from "./chart-grid-axes";
import { ChartState } from "./chart-state";
import { ChartTooltip } from "./chart-tooltip";

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
			<ChartCard config={chartConfig}>
				<AreaChart accessibilityLayer data={chartData}>
					<ChartAreaGradients
						expensesGradientId={expensesGradientId}
						incomesGradientId={incomesGradientId}
					/>
					<ChartGridAxes yAxisMax={yAxisMax} language={i18n.language} />
					<ChartTooltip chartConfig={chartConfig} language={i18n.language} />
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
			</ChartCard>
		</ChartState>
	);
};
