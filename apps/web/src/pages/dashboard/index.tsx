import { useTranslation } from "react-i18next";
import { Heading } from "@/shared/components";
import { Summary } from "./ui/summary/summary";
import { CumulativeChartSection } from "./widgets/cumulative-chart-section/cumulative-chart-section";
import { DailyChartSection } from "./widgets/daily-chart-section/daily-chart-section";

export const DashboardPage = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-6">
			<Heading>{t("title", { ns: "dashboard" })}</Heading>
			<Summary />
			<DailyChartSection />
			<CumulativeChartSection />
		</div>
	);
};
