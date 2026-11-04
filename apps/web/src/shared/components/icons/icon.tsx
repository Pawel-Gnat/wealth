import { cn } from "cn";
import { type IconVariant, iconVariants } from "./icon.variants";
import type { IconName } from "./icons";
import { icons } from "./icons";

type IconProps = {
	name: IconName;
	size?: number;
	className?: string;
} & IconVariant;

export const Icon = ({
	name,
	size = 16,
	className,
	variant,
	color,
}: IconProps) => {
	const IconComponent = icons[name];
	return (
		<IconComponent
			size={size}
			className={cn(iconVariants({ variant, color }), className)}
		/>
	);
};
