import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { textVariants } from "./text.variants";

export type TextProps = {
	as?: "p" | "span";
	size?: VariantProps<typeof textVariants>["size"];
	color?: NonNullable<VariantProps<typeof textVariants>["color"]>;
	weight?: VariantProps<typeof textVariants>["weight"];
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
