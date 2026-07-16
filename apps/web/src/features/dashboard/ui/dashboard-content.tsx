import { useTranslation } from "react-i18next";
import { DashboardChartSection } from "@/features/dashboard/ui/dashboard-chart-section";
import { DashboardWidgets } from "@/features/dashboard/ui/dashboard-widgets";
import { Heading } from "@/shared/components";

export const DashboardContent = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-6">
			<Heading>{t("title", { ns: "dashboard" })}</Heading>
			<DashboardWidgets />
			<DashboardChartSection />
		</div>
	);
};
