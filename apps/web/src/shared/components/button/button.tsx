import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import {
	Button as ButtonUI,
	type buttonVariants as shadcnButtonVariants,
} from "@/shared/lib/ui/button";
import { Icon } from "../icons";
import { buttonVariants } from "./button.variants";

type ButtonProps = {
	children: ReactNode;
	className?: string;
	asChild?: boolean;
	isLoading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> &
	Pick<VariantProps<typeof shadcnButtonVariants>, "size">;

export const Button = ({
	children,
	className,
	variant,
	size,
	asChild = false,
	isLoading = false,
	disabled,
	...props
}: ButtonProps) => {
	return (
		<ButtonUI
			variant={variant === "input" ? "outline" : variant}
			size={size}
			className={buttonVariants({ variant, className })}
			asChild={asChild}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? <Icon name="loader" className="animate-spin" /> : children}
		</ButtonUI>
	);
};
