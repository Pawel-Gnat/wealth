import type { ReactNode } from "react";
import { Body as EmailBody } from "react-email";

export const Body = ({ children }: { children: ReactNode }) => {
	return (
		<EmailBody className="bg-background-muted font-sans p-2">
			{children}
		</EmailBody>
	);
};
