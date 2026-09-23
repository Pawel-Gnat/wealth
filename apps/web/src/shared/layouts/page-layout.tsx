import { Heading, Text } from "@/shared/components";

type PageLayoutProps = {
	title: string;
	subtitle: string;
	children: React.ReactNode;
};

export const PageLayout = ({ title, subtitle, children }: PageLayoutProps) => {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<Heading>{title}</Heading>
				<Text size="sm" color="muted">
					{subtitle}
				</Text>
			</div>
			{children}
		</div>
	);
};
