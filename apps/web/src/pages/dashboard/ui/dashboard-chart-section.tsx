import type { ChartDays } from "@repo/api/schemas";
import type { ReactNode } from "react";
import { Heading2 } from "@/shared/components";
import { ChartDaysToggle } from "./chart-days-toggle";
import { DashboardChartLegend } from "./dashboard-chart-legend";

type DashboardChartSectionProps = {
	title: string;
	days: ChartDays;
	onDaysChange: (days: ChartDays) => void;
	children: ReactNode;
};

export const DashboardChartSection = ({
	title,
	days,
	onDaysChange,
	children,
}: DashboardChartSectionProps) => {
	return (
		<section className="flex flex-col gap-4">
			<Heading2>{title}</Heading2>
			<ChartDaysToggle value={days} onValueChange={onDaysChange} />
			<DashboardChartLegend />
			{children}
		</section>
	);
};
