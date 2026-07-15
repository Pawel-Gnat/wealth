import type { ChartPeriod } from "@repo/api/schemas";
import { useTranslation } from "react-i18next";
import { useDashboardChart } from "@/features/dashboard/api/use-dashboard-chart";
import { Card, ErrorState } from "@/shared/components";
import { DashboardChartSkeleton } from "./dashboard-chart-skeleton";

type DashboardChartProps = {
	chartPeriod: ChartPeriod;
};

export const DashboardChart = ({ chartPeriod }: DashboardChartProps) => {
	const { t } = useTranslation();
	const { data, isLoading, isError } = useDashboardChart({ chartPeriod });

	if (isLoading) {
		return <DashboardChartSkeleton />;
	}

	if (isError || !data) {
		return <ErrorState text={t("chart.error", { ns: "dashboard" })} />;
	}

	return (
		<Card
			content={<div className="aspect-video w-full" aria-hidden="true" />}
		/>
	);
};
