import type { ReactNode } from "react";
import { Card } from "@/shared/components";
import type { ChartConfig } from "@/shared/lib/ui/chart";
import { ChartContainer } from "@/shared/lib/ui/chart";

type ChartCardProps = {
	config: ChartConfig;
	children: ReactNode;
};

export const ChartCard = ({ config, children }: ChartCardProps) => {
	return (
		<Card
			content={
				<ChartContainer
					config={config}
					className="w-full max-h-80 aspect-video"
				>
					{children}
				</ChartContainer>
			}
		/>
	);
};
