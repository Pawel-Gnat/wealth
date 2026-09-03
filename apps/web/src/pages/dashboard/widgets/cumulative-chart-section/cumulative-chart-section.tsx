import { type ChartDays, DEFAULT_CHART_DAYS } from "@repo/api/schemas";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChartSection } from "../../ui/chart/chart-section";
import { ChartSkeleton } from "../../ui/chart/chart-skeleton";

const CumulativeChart = lazy(async () => {
	const module = await import("../../ui/chart/cumulative-chart");

	return { default: module.CumulativeChart };
});

export const CumulativeChartSection = () => {
	const { t } = useTranslation();
	const [days, setDays] = useState<ChartDays>(DEFAULT_CHART_DAYS);

	return (
		<ChartSection
			title={t("chart.running_title", { ns: "dashboard" })}
			days={days}
			onDaysChange={setDays}
		>
			<Suspense fallback={<ChartSkeleton />}>
				<CumulativeChart days={days} />
			</Suspense>
		</ChartSection>
	);
};
