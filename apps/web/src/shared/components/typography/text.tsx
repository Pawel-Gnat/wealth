import { cn } from "cn";
import {
	type TextColor,
	type TextSize,
	type TextWeight,
	textVariants,
} from "./text.variants";

export type TextProps = {
	as?: "p" | "span";
	size?: TextSize | undefined;
	color?: TextColor | undefined;
	weight?: TextWeight;
} & React.HTMLAttributes<HTMLParagraphElement>;

export const Text = ({
	className,
	as = "p",
	size = "base",
	weight = "normal",
	color = "default",
	...props
}: TextProps) => {
	const Tag = as;

	return (
		<Tag
			data-slot="text"
			data-tone={color}
			className={cn(textVariants({ size, weight, color }), className)}
			{...props}
		>
			{props.children}
		</Tag>
	);
};
