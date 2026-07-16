import { dashboardWidgetKinds } from "@repo/api/schemas";
import { useTranslation } from "react-i18next";
import { useDashboardWidgets } from "@/features/dashboard/api/use-dashboard-widgets";
import { buildWidgetLabel } from "@/features/dashboard/helpers/widget-label";
import { DashboardWidgetCard } from "@/features/dashboard/ui/dashboard-widget-card";
import { DashboardWidgetsSkeleton } from "@/features/dashboard/ui/dashboard-widgets-skeleton";
import { ErrorState } from "@/shared/components";

export const DashboardWidgets = () => {
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useDashboardWidgets();

	if (isLoading) {
		return <DashboardWidgetsSkeleton />;
	}

	if (isError || !data) {
		return <ErrorState text={t("widgets.error", { ns: "dashboard" })} />;
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			{dashboardWidgetKinds.map((kind) => (
				<DashboardWidgetCard
					key={kind}
					kind={kind}
					label={buildWidgetLabel(t, kind)}
					widget={data[kind]}
					language={i18n.language}
				/>
			))}
		</div>
	);
};
