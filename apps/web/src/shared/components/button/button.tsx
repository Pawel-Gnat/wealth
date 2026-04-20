import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/tailwind/utils";

import { Button as ButtonUI, buttonVariants } from "@/shared/lib/ui/button";
import { Icon } from "../icons";

type ButtonProps = {
	children: ReactNode;
	className?: string;
	asChild?: boolean;
	isLoading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;

const Button = ({
	children,
	className,
	variant,
	size,
	asChild = false,
	isLoading = false,
	...props
}: ButtonProps) => {
	return (
		<ButtonUI
			className={cn(buttonVariants({ variant, size, className }))}
			asChild={asChild}
			{...props}
		>
			{children}
		</ButtonUI>
	);
};

export const ButtonPrimary = ({
	children,
	isLoading = false,
	className,
	size = "default",
	...props
}: ButtonProps) => {
	return (
		<Button size={size} className={cn(className)} {...props}>
			{isLoading ? <Icon name="loader" className="animate-spin" /> : children}
		</Button>
	);
};

export const ButtonSecondary = ({
	children,
	isLoading = false,
	className,
	size = "default",
	...props
}: ButtonProps) => {
	return (
		<Button
			size={size}
			className={cn(
				"bg-secondary text-primary border-primary/20 hover:bg-secondary/80 hover:border-primary/60 border",

				className,
			)}
			{...props}
		>
			{isLoading ? <Icon name="loader" className="animate-spin" /> : children}
		</Button>
	);
};

export const ButtonDestructive = ({
	children,
	isLoading = false,
	className,
	size = "default",
	...props
}: ButtonProps) => {
	return (
		<Button
			size={size}
			className={cn(
				"bg-destructive text-primary-foreground hover:bg-destructive/90",
				className,
			)}
			{...props}
		>
			{isLoading ? <Icon name="loader" className="animate-spin" /> : children}
		</Button>
	);
};
