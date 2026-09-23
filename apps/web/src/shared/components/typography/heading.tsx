import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { headingVariants } from "./heading.variants";

export type HeadingProps = {
	as?: NonNullable<VariantProps<typeof headingVariants>["as"]>;
} & React.HTMLAttributes<HTMLHeadingElement>;

export const Heading = ({ as = "h1", className, ...props }: HeadingProps) => {
	const Tag = as;

	return (
		<Tag
			data-slot="heading"
			className={cn(headingVariants({ as }), className)}
			{...props}
		>
			{props.children}
		</Tag>
	);
};
