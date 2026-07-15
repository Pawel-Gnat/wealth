import type { DashboardWidgetKind } from "@repo/api/schemas";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import type { TFunction } from "i18next";

export const buildWidgetLabel = (
	t: TFunction,
	kind: DashboardWidgetKind,
): string => {
	const title = t(`widgets.${kind}`, { ns: "dashboard" });
	const month = format(new Date(), "MMMM", { locale: enUS });

	return `${title} · ${month}`;
};
