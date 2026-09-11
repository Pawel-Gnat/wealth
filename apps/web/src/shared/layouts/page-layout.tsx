import { Heading } from "@/shared/components";
import { TextMuted } from "../components/typography/text";

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
				<TextMuted size="sm">{subtitle}</TextMuted>
			</div>
			{children}
		</div>
	);
};
