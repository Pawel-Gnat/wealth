import type { ReactNode } from "react";
import { Heading as EmailHeading, Text as EmailText } from "react-email";

type TextProps = {
	children: ReactNode;
	size?: "xs" | "sm" | "base" | "lg";
	weight?: "normal" | "medium" | "bold";
	className?: string;
};

const sizeClasses: Record<NonNullable<TextProps["size"]>, string> = {
	xs: "text-xs leading-5",
	sm: "text-sm leading-5",
	base: "text-base leading-6",
	lg: "text-lg leading-7",
};

const weightClasses: Record<NonNullable<TextProps["weight"]>, string> = {
	normal: "font-normal",
	medium: "font-medium",
	bold: "font-bold",
};

type TextStylePick = Pick<TextProps, "size" | "weight" | "className">;
type TextStyleProps = {
	[P in keyof TextStylePick]?: TextStylePick[P] | undefined;
};

function buildClassName(
	baseClasses: string,
	{ size = "base", weight = "normal", className = "" }: TextStyleProps,
): string {
	const parts = [
		baseClasses,
		sizeClasses[size],
		weightClasses[weight],
		className,
	];
	return parts.filter(Boolean).join(" ");
}

export function Text({ children, className, size, weight }: TextProps) {
	return (
		<EmailText
			className={buildClassName("text-foreground", { size, weight, className })}
		>
			{children}
		</EmailText>
	);
}

export function TextSecondary({
	children,
	className,
	size,
	weight,
}: TextProps) {
	return (
		<EmailText
			className={buildClassName("text-primary", { size, weight, className })}
		>
			{children}
		</EmailText>
	);
}

type HeadingProps = {
	children: ReactNode;
	className?: string;
};

export function Heading({ children, className }: HeadingProps) {
	return (
		<EmailHeading
			as="h1"
			className={`text-2xl font-bold text-foreground ${className ?? ""}`.trim()}
		>
			{children}
		</EmailHeading>
	);
}

export function Heading2({ children, className }: HeadingProps) {
	return (
		<EmailHeading
			as="h2"
			className={`text-xl font-bold text-foreground ${className ?? ""}`.trim()}
		>
			{children}
		</EmailHeading>
	);
}
