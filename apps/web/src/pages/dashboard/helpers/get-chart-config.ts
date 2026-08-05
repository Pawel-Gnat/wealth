import type { TFunction } from "i18next";
import type { ChartConfig } from "@/shared/lib/ui/chart";

export const getChartConfig = (t: TFunction): ChartConfig => ({
	expenses: {
		label: t("common.expenses", { ns: "common" }),
		color: "var(--destructive)",
	},
	incomes: {
		label: t("common.incomes", { ns: "common" }),
		color: "var(--success)",
	},
});
