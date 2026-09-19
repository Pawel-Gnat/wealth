import { DEFAULT_PERIOD } from "@repo/api/schemas";
import type { Period } from "@repo/api/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/shared/layouts";
import { ChartLegend } from "./ui/chart/chart-legend";
import { PeriodToggle } from "./ui/period-toggle";
import { Summary } from "./ui/summary/summary";
import { CumulativeChartSection } from "./widgets/cumulative-chart-section/cumulative-chart-section";
import { DailyChartSection } from "./widgets/daily-chart-section/daily-chart-section";

export const DashboardPage = () => {
	const { t } = useTranslation();
	const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);

	return (
		<PageLayout
			title={t("title", { ns: "dashboard" })}
			subtitle={t("subtitle", { ns: "dashboard" })}
		>
			<PeriodToggle value={period} onValueChange={setPeriod} />
			<Summary />
			<ChartLegend />
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<DailyChartSection days={period} />
				<CumulativeChartSection days={period} />
			</div>
		</PageLayout>
	);
};
