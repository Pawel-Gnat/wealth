import { cva, type VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/shared/lib/ui/badge";

const trendBadgeVariant = {
	positive:
		"bg-success/10 text-success focus-visible:ring-success/20 dark:bg-success/20 dark:focus-visible:ring-success/40",
	negative:
		"bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40",
	neutral:
		"bg-muted text-muted-foreground focus-visible:ring-ring/20 dark:bg-muted dark:focus-visible:ring-ring/40",
} as const;

export const trendBadgeVariants = cva("", {
	variants: {
		variant: trendBadgeVariant,
	},
});

export const trendBadgeVariantOptions = Object.keys(trendBadgeVariant) as Array<
	keyof typeof trendBadgeVariant
>;

type UiBadgeVariant = NonNullable<
	VariantProps<typeof badgeVariants>["variant"]
>;

const uiBadgeVariant = {
	default: "",
	secondary: "",
	destructive: "",
	outline: "",
	ghost: "",
	link: "",
} as const satisfies Record<UiBadgeVariant, string>;

const uiBadgeVariantOptions = Object.keys(
	uiBadgeVariant,
) as Array<UiBadgeVariant>;

export type TrendBadgeVariant = keyof typeof trendBadgeVariant;
export type BadgeVariant = UiBadgeVariant | TrendBadgeVariant;

export const badgeVariantOptions = [
	...uiBadgeVariantOptions,
	...trendBadgeVariantOptions,
];
