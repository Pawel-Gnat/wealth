import { useTranslation } from "react-i18next";
import { Heading } from "@/shared/components";
import { DashboardCumulativeChartSection } from "./ui/dashboard-cumulative-chart-section";
import { DashboardDailyChartSection } from "./ui/dashboard-daily-chart-section";
import { Summary } from "./ui/summary/summary";

export const DashboardPage = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-6">
			<Heading>{t("title", { ns: "dashboard" })}</Heading>
			<Summary />
			<DashboardDailyChartSection />
			<DashboardCumulativeChartSection />
		</div>
	);
};
