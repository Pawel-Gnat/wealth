import { type ChartDays, DEFAULT_CHART_DAYS } from "@repo/api/schemas";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChartSection } from "../../ui/chart/chart-section";
import { ChartSkeleton } from "../../ui/chart/chart-skeleton";

const DailyChart = lazy(async () => {
	const module = await import("../../ui/chart/daily-chart");

	return { default: module.DailyChart };
});

export const DailyChartSection = () => {
	const { t } = useTranslation();
	const [days, setDays] = useState<ChartDays>(DEFAULT_CHART_DAYS);

	return (
		<ChartSection
			title={t("chart.daily_title", { ns: "dashboard" })}
			days={days}
			onDaysChange={setDays}
		>
			<Suspense fallback={<ChartSkeleton />}>
				<DailyChart days={days} />
			</Suspense>
		</ChartSection>
	);
};
