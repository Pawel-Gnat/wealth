import type { ParseKeys } from "@repo/common/i18n";
import { useTranslation } from "react-i18next";
import { Text } from "@/shared/components";
import { cn } from "@/shared/lib/tailwind/utils";

const LEGEND_ITEMS = [
	{
		label: "common.expenses",
		className: "bg-destructive",
	},
	{
		label: "common.incomes",
		className: "bg-success",
	},
] satisfies { label: ParseKeys<"common">; className: string }[];

export const ChartLegend = () => {
	return (
		<div className="flex flex-wrap items-center gap-4">
			{LEGEND_ITEMS.map((item) => (
				<ChartLegendItem key={item.label} {...item} />
			))}
		</div>
	);
};

type ChartLegendItemProps = {
	label: (typeof LEGEND_ITEMS)[number]["label"];
	className: (typeof LEGEND_ITEMS)[number]["className"];
};

const ChartLegendItem = ({ label, className }: ChartLegendItemProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center gap-2">
			<span
				className={cn("size-2 shrink-0 rounded-[2px]", className)}
				aria-hidden="true"
			/>
			<Text as="span" size="sm">
				{t(label, { ns: "common" })}
			</Text>
		</div>
	);
};
