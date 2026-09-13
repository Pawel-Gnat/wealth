import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Icon, ToggleGroup } from "@/shared/components";

export const chartTypes = ["bar", "area"] as const;
export type ChartType = (typeof chartTypes)[number];

type ChartToggleProps = {
	value: ChartType;
	onValueChange: (type: ChartType) => void;
};

export const ChartToggle = ({ value, onValueChange }: ChartToggleProps) => {
	const { t } = useTranslation();

	const items = useMemo(
		() =>
			chartTypes.map((type) => {
				const label = t(
					type === "area" ? "chart.switch.area" : "chart.switch.bar",
					{
						ns: "dashboard",
					},
				);

				return {
					value: type,
					content: (
						<>
							<Icon name={type === "bar" ? "chartBar" : "chartArea"} />
							{label}
						</>
					),
					ariaLabel: label,
				};
			}),
		[t],
	);

	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={(next) => {
				if (next === "area" || next === "bar") {
					onValueChange(next);
				}
			}}
			items={items}
		/>
	);
};
