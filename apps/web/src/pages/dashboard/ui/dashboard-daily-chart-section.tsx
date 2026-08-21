import { type ChartDays, DEFAULT_CHART_DAYS } from "@repo/api/schemas";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardChartSection } from "./dashboard-chart-section";
import { DashboardChartSkeleton } from "./dashboard-chart-skeleton";

const DailyChart = lazy(async () => {
	const module = await import("./daily-chart/daily-chart");

	return { default: module.DailyChart };
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
				<DailyChart days={days} />
			</Suspense>
		</DashboardChartSection>
	);
};
