import { cva, type VariantProps } from "class-variance-authority";

export const headingVariants = cva("font-bold", {
	variants: {
		as: {
			h1: "text-h1 leading-h1",
			h2: "text-h2 leading-h2",
			h3: "text-h3 leading-h3",
		},
	},
	defaultVariants: {
		as: "h1",
	},
});

export type HeadingTag = NonNullable<
	VariantProps<typeof headingVariants>["as"]
>;
