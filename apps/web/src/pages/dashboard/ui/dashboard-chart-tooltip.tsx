import { Text } from "@/shared/components";
import { formatPrice } from "@/shared/helpers/price";
import {
	type ChartConfig,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/lib/ui/chart";

type DashboardChartTooltipProps = {
	chartConfig: ChartConfig;
	language: string;
};

export const DashboardChartTooltip = ({
	chartConfig,
	language,
}: DashboardChartTooltipProps) => {
	return (
		<ChartTooltip
			content={
				<ChartTooltipContent
					indicator="line"
					formatter={(value, name, item) => (
						<>
							<div
								className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
								style={{
									backgroundColor: item.color,
								}}
							/>
							<div className="flex flex-1 items-center justify-between gap-2 leading-none">
								<Text as="span" size="xs" className="text-muted-foreground">
									{chartConfig[name as keyof typeof chartConfig]?.label ?? name}
								</Text>
								<Text
									as="span"
									size="xs"
									weight="medium"
									className="font-mono text-foreground tabular-nums"
								>
									{formatPrice(Number(value), language)}
								</Text>
							</div>
						</>
					)}
				/>
			}
		/>
	);
};
