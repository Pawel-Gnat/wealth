import { type Period, periodSchema, periodValues } from "@repo/api/schemas";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ToggleGroup } from "@/shared/components";

type PeriodToggleProps = {
	value: Period;
	onValueChange: (period: Period) => void;
};

export const PeriodToggle = ({ value, onValueChange }: PeriodToggleProps) => {
	const { t } = useTranslation();

	const items = useMemo(
		() =>
			periodValues.map((period) => {
				const label = t("common.last-n-days-other", {
					ns: "common",
					count: period,
				});

				return {
					value: String(period),
					content: label,
					ariaLabel: label,
				};
			}),
		[t],
	);

	return (
		<ToggleGroup
			type="single"
			value={String(value)}
			onValueChange={(next) => {
				if (!next) {
					return;
				}

				const parsed = periodSchema.safeParse(Number(next));
				if (parsed.success) {
					onValueChange(parsed.data);
				}
			}}
			items={items}
		/>
	);
};
