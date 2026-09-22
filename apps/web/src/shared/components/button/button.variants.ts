import { cva } from "class-variance-authority";

export const buttonVariants = cva("", {
	variants: {
		variant: {
			default: "",
			outline: "",
			secondary: "",
			ghost: "",
			destructive: "",
			link: "",
			input: "bg-input/50 text-input-foreground hover:bg-input/30",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});
