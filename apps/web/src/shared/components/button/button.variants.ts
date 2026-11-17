import { cva } from "class-variance-authority";

const buttonVariant = {
	default: "",
	outline: "",
	secondary: "",
	ghost: "",
	destructive: "",
	link: "",
	input: "bg-input/50 text-input-foreground hover:bg-input/30 font-normal",
} as const;

export const buttonVariantOptions = Object.keys(buttonVariant) as Array<
	keyof typeof buttonVariant
>;

export const buttonVariants = cva("gap-2", {
	variants: {
		variant: buttonVariant,
	},
	defaultVariants: {
		variant: "default",
	},
});
