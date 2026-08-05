import {
	type ChartDays,
	chartDaysSchema,
	chartDaysValues,
} from "@repo/api/schemas";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ToggleGroup } from "@/shared/components";

type ChartDaysToggleProps = {
	value: ChartDays;
	onValueChange: (days: ChartDays) => void;
};

export const ChartDaysToggle = ({
	value,
	onValueChange,
}: ChartDaysToggleProps) => {
	const { t } = useTranslation();

	const items = useMemo(
		() =>
			chartDaysValues.map((days) => {
				const label = t("common.last_n_days", {
					ns: "common",
					count: days,
				});

				return {
					value: String(days),
					content: label,
					ariaLabel: label,
				};
			}),
		[t],
	);

	return (
		<ToggleGroup
			type="single"
			variant="outline"
			spacing={0}
			value={String(value)}
			onValueChange={(next) => {
				if (!next) {
					return;
				}

				const parsed = chartDaysSchema.safeParse(Number(next));
				if (parsed.success) {
					onValueChange(parsed.data);
				}
			}}
			items={items}
		/>
	);
};
