import type { ReactNode } from "react";
import {
	TooltipContent,
	TooltipTrigger,
	Tooltip as TooltipUI,
} from "@/shared/lib/ui/tooltip";
import { Text } from "../typography";

type TooltipProps = {
	trigger: ReactNode;
	text: string;
};

export const Tooltip = ({ trigger, text }: TooltipProps) => {
	return (
		<TooltipUI>
			<TooltipTrigger asChild>{trigger}</TooltipTrigger>
			<TooltipContent>
				<Text size="xs">{text}</Text>
			</TooltipContent>
		</TooltipUI>
	);
};
