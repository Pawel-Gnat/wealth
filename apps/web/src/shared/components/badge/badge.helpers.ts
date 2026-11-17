import {
	type BadgeVariant,
	type TrendBadgeVariant,
	trendBadgeVariantOptions,
} from "./badge.variants";

export const isTrendVariant = (
	variant: BadgeVariant | undefined,
): variant is TrendBadgeVariant =>
	trendBadgeVariantOptions.some((option) => option === variant);
