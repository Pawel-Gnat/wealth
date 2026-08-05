import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ErrorState } from "@/shared/components";
import { DashboardChartSkeleton } from "./dashboard-chart-skeleton";

type DashboardChartQueryStateProps = {
	isLoading: boolean;
	isError: boolean;
	hasData: boolean;
	children: ReactNode;
};

export const DashboardChartQueryState = ({
	isLoading,
	isError,
	hasData,
	children,
}: DashboardChartQueryStateProps) => {
	const { t } = useTranslation();

	if (isLoading) {
		return <DashboardChartSkeleton />;
	}

	if (isError || !hasData) {
		return <ErrorState text={t("chart.error", { ns: "dashboard" })} />;
	}

	return children;
};
