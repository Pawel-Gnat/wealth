import type { ReactNode } from "react";
import { Link } from "react-email";

type ButtonProps = {
	children: ReactNode;
	href: string;
};

export const Button = ({ children, href }: ButtonProps) => {
	return (
		<Link
			href={href}
			className="bg-accent text-primary-foreground px-6 py-3 rounded-md font-sans font-bold no-underline inline-block my-3"
		>
			{children}
		</Link>
	);
};
