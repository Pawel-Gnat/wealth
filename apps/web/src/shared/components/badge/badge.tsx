import { cn } from "cn";
import type { ComponentProps } from "react";
import { Badge as BadgeUI } from "@/shared/lib/ui/badge";
import { isTrendVariant } from "./badge.helpers";
import { type BadgeVariant, trendBadgeVariants } from "./badge.variants";

type BadgeProps = Omit<ComponentProps<typeof BadgeUI>, "variant"> & {
	variant?: BadgeVariant;
};

export const Badge = ({
	variant = "default",
	className,
	...props
}: BadgeProps) => {
	if (isTrendVariant(variant)) {
		return (
			<BadgeUI
				className={cn(trendBadgeVariants({ variant }), className)}
				{...props}
			/>
		);
	}

	return <BadgeUI variant={variant} className={className} {...props} />;
};
