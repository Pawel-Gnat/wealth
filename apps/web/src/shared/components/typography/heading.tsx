import { cn } from "cn";
import { type HeadingTag, headingVariants } from "./heading.variants";

export type HeadingProps = {
	as?: HeadingTag;
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
