import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/tailwind/utils";
import { Badge as BadgeUI, type badgeVariants } from "@/shared/lib/ui/badge";

const trendBadgeVariants = cva("", {
	variants: {
		variant: {
			positive:
				"bg-success/10 text-success focus-visible:ring-success/20 dark:bg-success/20 dark:focus-visible:ring-success/40",
			negative:
				"bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40",
			neutral:
				"bg-muted text-muted-foreground focus-visible:ring-ring/20 dark:bg-muted dark:focus-visible:ring-ring/40",
		},
	},
});

type UiBadgeVariant = NonNullable<
	VariantProps<typeof badgeVariants>["variant"]
>;
export type TrendBadgeVariant = "positive" | "negative" | "neutral";
type BadgeVariant = UiBadgeVariant | TrendBadgeVariant;

type BadgeProps = Omit<ComponentProps<typeof BadgeUI>, "variant"> & {
	variant?: BadgeVariant;
};

const isTrendVariant = (
	variant: BadgeVariant | undefined,
): variant is TrendBadgeVariant =>
	variant === "positive" || variant === "negative" || variant === "neutral";

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
