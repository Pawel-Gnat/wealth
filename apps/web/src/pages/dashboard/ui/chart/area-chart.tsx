import type { DashboardChartPoint } from "@repo/api/types";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart as AreaChartUI } from "recharts";
import { ChartContainer } from "@/shared/components";
import { getChartConfig } from "../../helpers/get-chart-config";
import { getChartYAxisMax } from "../../helpers/get-chart-y-axis-max";
import { toChartData } from "../../helpers/to-chart-data";
import { ChartAreaGradients } from "./chart-area-gradients";
import { ChartGridAxes } from "./chart-grid-axes";
import { ChartTooltip } from "./chart-tooltip";

type AreaChartProps = {
	points: DashboardChartPoint[];
};

export const AreaChart = ({ points }: AreaChartProps) => {
	const gradientId = useId().replace(/:/g, "");
	const { t, i18n } = useTranslation();
	const chartConfig = getChartConfig(t);
	const expensesGradientId = `fill-expenses-${gradientId}`;
	const incomesGradientId = `fill-incomes-${gradientId}`;
	const chartData = points ? toChartData(points, i18n.language) : [];
	const yAxisMax = getChartYAxisMax(chartData);

	return (
		<ChartContainer
			config={chartConfig}
			className="w-full max-h-80 aspect-video"
		>
			<AreaChartUI accessibilityLayer data={chartData}>
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
			</AreaChartUI>
		</ChartContainer>
	);
};
