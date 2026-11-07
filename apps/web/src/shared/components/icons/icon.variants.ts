import { cva, type VariantProps } from "class-variance-authority";

export const iconVariants = cva("shrink-0", {
	variants: {
		variant: {
			default: "",
			filled: "size-6 rounded-full p-1.5",
			badge: "size-5 rounded-full p-1",
			status: "size-12 rounded-full p-3",
		},
		color: {
			default: "",
			muted: "",
			success: "",
			destructive: "",
		},
	},
	compoundVariants: [
		{
			variant: "filled",
			color: "muted",
			class: "bg-muted",
		},
		{
			variant: "badge",
			color: "success",
			class: "bg-accent text-accent-foreground",
		},
		{
			variant: "badge",
			color: "destructive",
			class: "bg-destructive/10 text-destructive",
		},
		{
			variant: "badge",
			color: "muted",
			class: "bg-muted text-foreground",
		},
		{
			variant: "status",
			color: "destructive",
			class: "bg-destructive text-destructive-foreground",
		},
		{
			variant: "status",
			color: "muted",
			class: "bg-muted",
		},
	],
	defaultVariants: {
		variant: "default",
		color: "default",
	},
});

export type IconVariant = VariantProps<typeof iconVariants>;
