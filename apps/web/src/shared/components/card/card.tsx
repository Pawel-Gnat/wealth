import { cn } from "cn";
import type { ReactNode } from "react";
import { CardContent, CardHeader, Card as CardUI } from "@/shared/lib/ui/card";
import { Text } from "../typography";

export type CardProps = {
	title?: string | undefined;
	subtitle?: string | undefined;
	actions?: ReactNode | undefined;
	children: ReactNode;
	className?: string | undefined;
	contentClassName?: string | undefined;
};

export const Card = ({
	title,
	subtitle,
	actions,
	children,
	className,
	contentClassName,
}: CardProps) => {
	return (
		<CardUI className={cn("shadow-xl/10", className)}>
			{(title || subtitle || actions) && (
				<CardHeader className="flex items-center gap-2 justify-between">
					{(title || subtitle) && (
						<div className="flex flex-col gap-2">
							{title && (
								<Text size="lg" weight="medium">
									{title}
								</Text>
							)}
							{subtitle && (
								<Text size="sm" color="muted">
									{subtitle}
								</Text>
							)}
						</div>
					)}
					{actions && <div className="ml-auto">{actions}</div>}
				</CardHeader>
			)}
			<CardContent className={contentClassName}>{children}</CardContent>
		</CardUI>
	);
};
