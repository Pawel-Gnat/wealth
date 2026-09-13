import {
	type ChartConfig,
	ChartContainer as ChartContainerUI,
} from "@/shared/lib/ui/chart";

type ChartContainerProps = {
	config: ChartConfig;
	className?: string | undefined;
	children: React.ReactNode;
};

export const ChartContainer = ({
	config,
	className,
	children,
}: ChartContainerProps) => {
	return (
		<ChartContainerUI config={config} className={className}>
			{" "}
			{children}{" "}
		</ChartContainerUI>
	);
};
