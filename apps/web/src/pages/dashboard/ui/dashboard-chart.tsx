import type { ChartPeriod } from "@repo/api/schemas";
import { useTranslation } from "react-i18next";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { getChartConfig } from "@/pages/dashboard/helpers/get-chart-config";
import { getChartYAxisMax } from "@/pages/dashboard/helpers/get-chart-y-axis-max";
import { toChartData } from "@/pages/dashboard/helpers/to-chart-data";
import { useDashboardChart } from "@/pages/dashboard/hooks/use-dashboard-chart";
import { Card, ErrorState, Text } from "@/shared/components";
import { formatPrice } from "@/shared/helpers/price";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/lib/ui/chart";
import { DashboardChartSkeleton } from "./dashboard-chart-skeleton";

type DashboardChartProps = {
	chartPeriod: ChartPeriod;
};

export const DashboardChart = ({ chartPeriod }: DashboardChartProps) => {
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useDashboardChart({ chartPeriod });
	const chartConfig = getChartConfig(t);

	if (isLoading) {
		return <DashboardChartSkeleton />;
	}

	if (isError || !data) {
		return <ErrorState text={t("chart.error", { ns: "dashboard" })} />;
	}

	const chartData = toChartData(data.points, i18n.language);
	const yAxisMax = getChartYAxisMax(chartData);

	return (
		<Card
			content={
				<ChartContainer
					config={chartConfig}
					className="w-full max-h-80 aspect-video"
				>
					<LineChart accessibilityLayer data={chartData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={24}
						/>
						<YAxis
							domain={[0, yAxisMax]}
							tickCount={5}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							width={64}
							tickFormatter={(value) =>
								formatPrice(Number(value), i18n.language)
							}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									indicator="line"
									formatter={(value, name, item) => (
										<>
											<div
												className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
												style={{
													backgroundColor: item.color,
												}}
											/>
											<div className="flex flex-1 items-center justify-between gap-2 leading-none">
												<Text
													as="span"
													size="xs"
													className="text-muted-foreground"
												>
													{chartConfig[name as keyof typeof chartConfig]
														?.label ?? name}
												</Text>
												<Text
													as="span"
													size="xs"
													weight="medium"
													className="font-mono text-foreground tabular-nums"
												>
													{formatPrice(Number(value), i18n.language)}
												</Text>
											</div>
										</>
									)}
								/>
							}
						/>
						<Line
							type="monotone"
							dataKey="expensesCumulative"
							stroke="var(--color-expensesCumulative)"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="incomesCumulative"
							stroke="var(--color-incomesCumulative)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			}
		/>
	);
};
