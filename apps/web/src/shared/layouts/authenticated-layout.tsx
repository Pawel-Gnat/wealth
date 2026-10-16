import { Navigate, Outlet } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { useAuth } from "@/context/auth";
import { AuthSessionStatus } from "./auth-session-status";

export const AuthenticatedLayout = () => {
	const { isAuthenticated } = useAuth();

	return (
		<AuthSessionStatus>
			{isAuthenticated ? <Outlet /> : <Navigate to={APP_ROUTES.auth} replace />}
		</AuthSessionStatus>
	);
};
