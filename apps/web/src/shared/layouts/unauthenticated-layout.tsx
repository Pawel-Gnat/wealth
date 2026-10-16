import { Navigate, Outlet } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { useAuth } from "@/context/auth";
import { AuthSessionStatus } from "./auth-session-status";

export const UnauthenticatedLayout = () => {
	const { isAuthenticated } = useAuth();

	return (
		<AuthSessionStatus>
			{isAuthenticated ? (
				<Navigate to={APP_ROUTES.dashboard} replace />
			) : (
				<Outlet />
			)}
		</AuthSessionStatus>
	);
};
