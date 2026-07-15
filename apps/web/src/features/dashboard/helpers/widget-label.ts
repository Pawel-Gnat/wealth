import type { DashboardWidgetKind } from "@repo/api/schemas";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import type { TFunction } from "i18next";

const getWidgetTitle = (t: TFunction, kind: DashboardWidgetKind): string => {
	switch (kind) {
		case "expenses":
			return t("common.expenses", { ns: "common" });
		case "incomes":
			return t("common.incomes", { ns: "common" });
		case "netBalance":
			return t("common.net_balance", { ns: "common" });
	}
};

export const buildWidgetLabel = (
	t: TFunction,
	kind: DashboardWidgetKind,
): string => {
	const title = getWidgetTitle(t, kind);
	const month = format(new Date(), "MMMM", { locale: enUS });

	return `${title} · ${month}`;
};
