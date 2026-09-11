import type { Period } from "@repo/api/schemas";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CardState } from "@/shared/widgets/card-state";
import { useDashboardDailyChart } from "../../hooks/use-dashboard-daily-chart";
import { ChartToggle, type ChartType } from "../../ui/chart/chart-toggle";
import { DailyChart } from "../../ui/chart/daily-chart";

type DailyChartSectionProps = {
	days: Period;
};

export const DailyChartSection = ({ days }: DailyChartSectionProps) => {
	const { t } = useTranslation();
	const [type, setType] = useState<ChartType>("area");
	const { data, isLoading, isError } = useDashboardDailyChart({ days });

	return (
		<CardState
			title={t("chart.daily-title", { ns: "dashboard" })}
			actions={<ChartToggle value={type} onValueChange={setType} />}
			data={data}
			isLoading={isLoading}
			isError={isError}
			skeletonClassName="aspect-video max-h-80 w-full"
			errorTitle={t("chart.error.title", { ns: "dashboard" })}
			errorDescription={t("chart.error.description-daily", { ns: "dashboard" })}
			emptyTitle={t("chart.empty.title", { ns: "dashboard" })}
			emptyDescription={t("chart.empty.description", { ns: "dashboard" })}
			emptyIcon="dashboard"
		>
			{(data) => <DailyChart points={data.points} type={type} />}
		</CardState>
	);
};
