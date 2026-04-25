import type { ComponentProps } from "react";
import { NavLink as RouterNavLink } from "react-router";
import type { AppRoutePath } from "@/app/router";
import { cn } from "@/shared/lib/tailwind/utils";

type NavLinkProps = Omit<
	ComponentProps<typeof RouterNavLink>,
	"to" | "className"
> & {
	to: AppRoutePath;
};

export const NavLink = ({ to, children, ...rest }: NavLinkProps) => {
	return (
		<RouterNavLink
			to={to}
			className={({ isActive }) =>
				cn(
					"rounded-md px-3 py-2 text-sm font-medium transition-colors",
					isActive
						? "bg-accent text-accent-foreground"
						: "text-muted-foreground hover:bg-muted hover:text-foreground",
				)
			}
			{...rest}
		>
			{children}
		</RouterNavLink>
	);
};
