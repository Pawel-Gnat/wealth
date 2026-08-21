import type { SummaryKind } from "@repo/api/schemas";
import type { TFunction } from "i18next";

export const getSummaryTitle = (t: TFunction, kind: SummaryKind): string => {
	switch (kind) {
		case "expenses":
			return t("common.expenses", { ns: "common" });
		case "incomes":
			return t("common.incomes", { ns: "common" });
		case "netBalance":
			return t("common.net_balance", { ns: "common" });
	}
};
