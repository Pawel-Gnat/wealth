import { summaryKinds } from "@repo/api/schemas";
import { useTranslation } from "react-i18next";

import { useDashboardSummary } from "@/pages/dashboard/hooks/use-dashboard-summary";
import { ErrorState } from "@/shared/components";
import { SummaryCard } from "../summary-card/summary-card";
import { getSummaryTitle } from "./helpers/summary-label.helpers";
import { SummarySkeleton } from "./summary-skeleton";

export const Summary = () => {
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useDashboardSummary();

	if (isLoading) {
		return <SummarySkeleton />;
	}

	if (isError || !data) {
		return <ErrorState text={t("summary.error", { ns: "dashboard" })} />;
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			{summaryKinds.map((kind) => (
				<SummaryCard
					key={kind}
					kind={kind}
					label={getSummaryTitle(t, kind)}
					summary={data[kind]}
					language={i18n.language}
				/>
			))}
		</div>
	);
};
