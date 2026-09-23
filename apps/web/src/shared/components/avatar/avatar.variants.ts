import { cva } from "class-variance-authority";

export const avatarVariants = cva(
	"[&_[data-slot=avatar-fallback]]:bg-primary [&_[data-slot=avatar-fallback]]:text-primary-foreground",
	{
		variants: {
			size: {
				sm: "",
				lg: "size-20 [&_[data-slot=avatar-fallback]]:text-3xl",
			},
		},
		defaultVariants: {
			size: "sm",
		},
	},
);
