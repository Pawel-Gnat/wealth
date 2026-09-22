import { summaryKinds } from "@repo/api/schemas";
import type { Period } from "@repo/api/types";
import { useTranslation } from "react-i18next";

import { useDashboardSummary } from "@/pages/dashboard/hooks/use-dashboard-summary";
import { Card, ErrorState } from "@/shared/components";
import { getSummaryTitle } from "./helpers/summary-label.helpers";
import { SummaryMetric } from "./summary-metric";

type SummaryProps = {
	days: Period;
};

export const Summary = ({ days }: SummaryProps) => {
	const { t } = useTranslation();
	const { data, isLoading, isError } = useDashboardSummary({ days });

	if (isError || (!isLoading && !data)) {
		return (
			<Card>
				<ErrorState
					title={t("summary.error.title", { ns: "dashboard" })}
					description={t("summary.error.description", { ns: "dashboard" })}
				/>
			</Card>
		);
	}

	return (
		<Card
			className="p-2"
			contentClassName="grid grid-cols-1 gap-4 md:grid-cols-3 p-1"
		>
			{summaryKinds.map((kind) => (
				<SummaryMetric
					key={kind}
					kind={kind}
					title={getSummaryTitle(t, kind)}
					summary={data?.[kind]}
					isLoading={isLoading}
				/>
			))}
		</Card>
	);
};
