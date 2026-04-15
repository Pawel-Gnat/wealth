import type { ReactNode } from "react";

type PageHeaderProps = {
	title: string;
	action?: ReactNode;
};

export function PageHeader({ title, action }: PageHeaderProps) {
	return (
		<header className="mb-6 flex flex-wrap items-start justify-between gap-3">
			<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
			{action ? <div className="shrink-0">{action}</div> : null}
		</header>
	);
}
