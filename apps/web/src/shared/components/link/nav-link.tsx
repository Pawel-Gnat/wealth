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
					"flex gap-2 items-center rounded-4xl px-3 py-2 text-sm transition-colors active:bg-primary/50",
					isActive ? "bg-primary font-medium" : "hover:bg-muted",
				)
			}
			{...rest}
		>
			{children}
		</RouterNavLink>
	);
};
