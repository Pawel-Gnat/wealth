import type { Period } from "@repo/api/schemas";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CardState } from "@/shared/widgets/card-state";
import { useDashboardCumulativeChart } from "../../hooks/use-dashboard-cumulative-chart";
import { ChartToggle, type ChartType } from "../../ui/chart/chart-toggle";
import { CumulativeChart } from "../../ui/chart/cumulative-chart";

type CumulativeChartSectionProps = {
	days: Period;
};

export const CumulativeChartSection = ({
	days,
}: CumulativeChartSectionProps) => {
	const { t } = useTranslation();
	const [type, setType] = useState<ChartType>("area");
	const { data, isLoading, isError } = useDashboardCumulativeChart({ days });

	return (
		<CardState
			title={t("chart.running-title", { ns: "dashboard" })}
			actions={<ChartToggle value={type} onValueChange={setType} />}
			data={data}
			isLoading={isLoading}
			isError={isError}
			skeletonClassName="aspect-video max-h-80 w-full"
			errorTitle={t("chart.error.title", { ns: "dashboard" })}
			errorDescription={t("chart.error.description-running", {
				ns: "dashboard",
			})}
			emptyTitle={t("chart.empty.title", { ns: "dashboard" })}
			emptyDescription={t("chart.empty.description", { ns: "dashboard" })}
			emptyIcon="dashboard"
		>
			{(data) => <CumulativeChart points={data.points} type={type} />}
		</CardState>
	);
};
