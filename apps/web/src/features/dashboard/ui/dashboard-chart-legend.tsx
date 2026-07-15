import { useTranslation } from "react-i18next";
import { Text } from "@/shared/components";

export const DashboardChartLegend = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-wrap items-center gap-4">
			<div className="flex items-center gap-2">
				<span
					className="size-2 shrink-0 rounded-[2px] bg-destructive"
					aria-hidden="true"
				/>
				<Text as="span" size="sm">
					{t("common.expenses", { ns: "common" })}
				</Text>
			</div>
			<div className="flex items-center gap-2">
				<span
					className="size-2 shrink-0 rounded-[2px] bg-success"
					aria-hidden="true"
				/>
				<Text as="span" size="sm">
					{t("common.incomes", { ns: "common" })}
				</Text>
			</div>
		</div>
	);
};
