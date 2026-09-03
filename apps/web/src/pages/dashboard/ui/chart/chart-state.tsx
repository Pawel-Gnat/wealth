import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ErrorState } from "@/shared/components";
import { ChartSkeleton } from "./chart-skeleton";

type ChartStateProps = {
	isLoading: boolean;
	isError: boolean;
	hasData: boolean;
	children: ReactNode;
};

export const ChartState = ({
	isLoading,
	isError,
	hasData,
	children,
}: ChartStateProps) => {
	const { t } = useTranslation();

	if (isLoading) {
		return <ChartSkeleton />;
	}

	if (isError || !hasData) {
		return <ErrorState text={t("chart.error", { ns: "dashboard" })} />;
	}

	return children;
};
