import { type ChartPeriod, chartPeriodValues } from "@repo/api/schemas";
import { lazy, Suspense, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ToggleGroup } from "@/shared/components";
import { DEFAULT_CHART_PERIOD } from "../model/chart-period";
import { DashboardChartLegend } from "./dashboard-chart-legend";
import { DashboardChartSkeleton } from "./dashboard-chart-skeleton";

const DashboardChart = lazy(async () => {
	const module = await import("./dashboard-chart");

	return { default: module.DashboardChart };
});

export const DashboardChartSection = () => {
	const { t } = useTranslation();
	const [chartPeriod, setChartPeriod] =
		useState<ChartPeriod>(DEFAULT_CHART_PERIOD);

	const periodToggleItems = useMemo(
		() =>
			chartPeriodValues.map((period) => ({
				value: period,
				content: t(`common.${period}`, { ns: "common" }),
				ariaLabel: t(`common.${period}`, { ns: "common" }),
			})),
		[t],
	);

	return (
		<section className="flex flex-col gap-4">
			<ToggleGroup
				type="single"
				variant="outline"
				spacing={0}
				value={chartPeriod}
				onValueChange={(value) => {
					if (value) {
						setChartPeriod(value as ChartPeriod);
					}
				}}
				items={periodToggleItems}
			/>
			<DashboardChartLegend />
			<Suspense fallback={<DashboardChartSkeleton />}>
				<DashboardChart chartPeriod={chartPeriod} />
			</Suspense>
		</section>
	);
};
