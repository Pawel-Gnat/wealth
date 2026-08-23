import { summaryKinds } from "@repo/api/schemas";
import { useTranslation } from "react-i18next";

import { useDashboardSummary } from "@/pages/dashboard/hooks/use-dashboard-summary";
import { ErrorState } from "@/shared/components";
import { getSummaryTitle } from "./helpers/summary-label.helpers";
import { SummaryCard, SummaryCardSkeleton } from "./summary-card";

const GRID_CLASS_NAME = "grid grid-cols-1 gap-4 md:grid-cols-3";

export const Summary = () => {
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useDashboardSummary();

	if (isLoading) {
		return (
			<div className={GRID_CLASS_NAME}>
				{summaryKinds.map((kind) => (
					<SummaryCardSkeleton key={kind} />
				))}
			</div>
		);
	}

	if (isError || !data) {
		return <ErrorState text={t("summary.error", { ns: "dashboard" })} />;
	}

	return (
		<div className={GRID_CLASS_NAME}>
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
