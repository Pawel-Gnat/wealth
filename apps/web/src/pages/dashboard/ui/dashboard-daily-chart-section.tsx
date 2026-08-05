import { type ChartDays, DEFAULT_CHART_DAYS } from "@repo/api/schemas";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardChartSection } from "./dashboard-chart-section";
import { DashboardChartSkeleton } from "./dashboard-chart-skeleton";

const DashboardDailyChart = lazy(async () => {
	const module = await import("./dashboard-daily-chart");

	return { default: module.DashboardDailyChart };
});

export const DashboardDailyChartSection = () => {
	const { t } = useTranslation();
	const [days, setDays] = useState<ChartDays>(DEFAULT_CHART_DAYS);

	return (
		<DashboardChartSection
			title={t("chart.daily_title", { ns: "dashboard" })}
			days={days}
			onDaysChange={setDays}
		>
			<Suspense fallback={<DashboardChartSkeleton />}>
				<DashboardDailyChart days={days} />
			</Suspense>
		</DashboardChartSection>
	);
};
