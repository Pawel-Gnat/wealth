import type { ReactNode } from "react";
import { CardContent, CardHeader, Card as CardUI } from "@/shared/lib/ui/card";

type CardProps = {
	header?: ReactNode;
	content: ReactNode;
};

export const Card = ({ header, content }: CardProps) => {
	return (
		<CardUI>
			{header && <CardHeader>{header}</CardHeader>}
			<CardContent>{content}</CardContent>
		</CardUI>
	);
};
