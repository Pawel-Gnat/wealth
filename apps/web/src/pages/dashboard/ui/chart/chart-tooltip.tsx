import { Price, Text } from "@/shared/components";
import {
	type ChartConfig,
	ChartTooltipContent,
	ChartTooltip as ChartTooltipUI,
} from "@/shared/lib/ui/chart";

type ChartTooltipProps = {
	chartConfig: ChartConfig;
	language: string;
};

export const ChartTooltip = ({ chartConfig, language }: ChartTooltipProps) => {
	return (
		<ChartTooltipUI
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
								<Price
									as="span"
									size="xs"
									weight="medium"
									className="font-mono text-foreground tabular-nums"
									amount={Number(value)}
									language={language}
								/>
							</div>
						</>
					)}
				/>
			}
		/>
	);
};
