import { NavLink, Outlet } from "react-router";
import { APP_ROUTES } from "@/app/router";
import { useAuth } from "@/context/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	[
		"rounded-md px-3 py-2 text-sm font-medium transition-colors",
		isActive
			? "bg-accent text-accent-foreground"
			: "text-muted-foreground hover:bg-muted hover:text-foreground",
	].join(" ");

export function DashboardLayout() {
	const { logout } = useAuth();

	return (
		<div className="flex min-h-dvh w-full">
			<aside className="flex w-56 shrink-0 flex-col border-r bg-card p-4">
				<div className="mb-6 font-semibold">Wealth</div>
				<nav className="flex flex-1 flex-col gap-1">
					<NavLink to={APP_ROUTES.dashboard} end className={navLinkClass}>
						Dashboard
					</NavLink>
					<NavLink to={APP_ROUTES.incomes.list} className={navLinkClass}>
						Incomes
					</NavLink>
					<NavLink to={APP_ROUTES.expenses.list} className={navLinkClass}>
						Expenses
					</NavLink>
				</nav>
				<button
					type="button"
					className="mt-auto rounded-md border px-3 py-2 text-sm font-medium"
					onClick={() => logout()}
				>
					Logout
				</button>
			</aside>
			<div className="min-w-0 flex-1 p-6">
				<Outlet />
			</div>
		</div>
	);
}
