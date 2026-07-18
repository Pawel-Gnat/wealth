import { useTranslation } from "react-i18next";
import { Heading } from "@/shared/components";
import { DashboardChartSection } from "./ui/dashboard-chart-section";
import { DashboardWidgets } from "./ui/dashboard-widgets";

export const DashboardPage = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-6">
			<Heading>{t("title", { ns: "dashboard" })}</Heading>
			<DashboardWidgets />
			<DashboardChartSection />
		</div>
	);
};
