import {
	type ChartDays,
	chartDaysValues,
	DEFAULT_CHART_DAYS,
} from "@repo/api/schemas";
import { lazy, Suspense, useMemo, useState } from "react";
import { ToggleGroup } from "@/shared/components";
import { DashboardChartLegend } from "./dashboard-chart-legend";
import { DashboardChartSkeleton } from "./dashboard-chart-skeleton";

const DashboardChart = lazy(async () => {
	const module = await import("./dashboard-chart");

	return { default: module.DashboardChart };
});

export const DashboardChartSection = () => {
	const [days, setDays] = useState<ChartDays>(DEFAULT_CHART_DAYS);

	const daysToggleItems = useMemo(
		() =>
			chartDaysValues.map((value) => ({
				value: String(value),
				content: String(value),
				ariaLabel: String(value),
			})),
		[],
	);

	return (
		<section className="flex flex-col gap-4">
			<ToggleGroup
				type="single"
				variant="outline"
				spacing={0}
				value={String(days)}
				onValueChange={(value) => setDays(Number(value) as ChartDays)}
				items={daysToggleItems}
			/>
			<DashboardChartLegend />
			<Suspense fallback={<DashboardChartSkeleton />}>
				<DashboardChart days={days} />
			</Suspense>
		</section>
	);
};
