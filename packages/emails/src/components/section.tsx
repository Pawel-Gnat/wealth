import type { ReactNode } from "react";
import { Section as EmailSection } from "react-email";

export const Section = ({ children }: { children: ReactNode }) => {
	return (
		<EmailSection className="bg-card m-auto rounded-lg max-w-[560px]">
			<div className="p-4">{children}</div>
		</EmailSection>
	);
};
