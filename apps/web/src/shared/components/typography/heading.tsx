import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/tailwind/utils";

export type HeadingProps = {
	children: ReactNode;
	className?: string;
} & HTMLAttributes<HTMLHeadingElement>;

const levelConfig = {
	1: { Tag: "h1" as const, sizeClass: "text-h1 leading-h1" },
	2: { Tag: "h2" as const, sizeClass: "text-h2 leading-h2" },
	3: { Tag: "h3" as const, sizeClass: "text-h3 leading-h3" },
	4: { Tag: "h4" as const, sizeClass: "text-h4 leading-h4" },
};

type BaseHeadingProps = HeadingProps & {
	level: keyof typeof levelConfig;
	toneClassName: string;
};

export const BaseHeading = ({
	children,
	className,
	level,
	toneClassName,
	...rest
}: BaseHeadingProps) => {
	const { Tag, sizeClass } = levelConfig[level];

	return (
		<Tag
			className={cn("font-bold", sizeClass, toneClassName, className)}
			{...rest}
		>
			{children}
		</Tag>
	);
};

export const Heading = (props: HeadingProps) => (
	<BaseHeading {...props} level={1} toneClassName="text-secondary-foreground" />
);

export const Heading2 = (props: HeadingProps) => (
	<BaseHeading {...props} level={2} toneClassName="text-secondary-foreground" />
);

export const Heading3 = (props: HeadingProps) => (
	<BaseHeading {...props} level={3} toneClassName="text-secondary-foreground" />
);

export const Heading4 = (props: HeadingProps) => (
	<BaseHeading {...props} level={4} toneClassName="text-secondary-foreground" />
);
