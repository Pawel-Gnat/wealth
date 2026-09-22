import { cva, type VariantProps } from "class-variance-authority";

export const textVariants = cva("", {
	variants: {
		size: {
			"2xs": "text-xxs leading-xxs",
			xs: "text-xs leading-xs",
			sm: "text-sm leading-sm",
			base: "text-base leading-base",
			lg: "text-lg leading-lg",
		},
		weight: {
			normal: "font-normal",
			medium: "font-medium",
			bold: "font-bold",
		},
		color: {
			default: "",
			secondary: "text-primary",
			muted: "text-muted-foreground",
			destructive: "text-destructive",
		},
	},
	defaultVariants: {
		size: "base",
		weight: "normal",
		color: "default",
	},
});

export type TextSize = NonNullable<VariantProps<typeof textVariants>["size"]>;
export type TextWeight = NonNullable<
	VariantProps<typeof textVariants>["weight"]
>;
export type TextColor = NonNullable<VariantProps<typeof textVariants>["color"]>;
