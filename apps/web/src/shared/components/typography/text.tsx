import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/tailwind/utils";

export type TextProps = {
	children: ReactNode;
	as?: "p" | "span";
	size?: "xxs" | "xs" | "sm" | "base" | "lg";
	weight?: "normal" | "medium" | "bold";
	className?: string;
} & HTMLAttributes<HTMLParagraphElement>;

const sizeClasses: Record<NonNullable<TextProps["size"]>, string> = {
	xxs: "text-xxs leading-xxs",
	xs: "text-xs leading-xs",
	sm: "text-sm leading-sm",
	base: "text-base leading-base",
	lg: "text-lg leading-lg",
};

type BaseTextProps = TextProps & {
	toneClassName: string;
};

export const BaseText = ({
	children,
	className,
	as = "p",
	size = "base",
	weight = "normal",
	toneClassName,
	...rest
}: BaseTextProps) => {
	const Component = as;
	const sizeClass = sizeClasses[size];
	const weightClass = `font-${weight}`;

	return (
		<Component
			className={cn(toneClassName, sizeClass, weightClass, className)}
			{...rest}
		>
			{children}
		</Component>
	);
};

export const Text = (props: TextProps) => (
	<BaseText {...props} toneClassName="text-secondary-foreground" />
);

export const TextSecondary = (props: TextProps) => (
	<BaseText {...props} toneClassName="text-primary" />
);

export const TextTetriary = (props: TextProps) => (
	<BaseText {...props} toneClassName="text-muted-foreground" />
);

export const TextMuted = (props: TextProps) => (
	<BaseText {...props} toneClassName="text-muted" />
);

export const TextError = ({ weight = "bold", ...props }: TextProps) => (
	<BaseText {...props} weight={weight} toneClassName="text-destructive" />
);

export const TextAccent = (props: TextProps) => (
	<BaseText {...props} toneClassName="text-accent" />
);
