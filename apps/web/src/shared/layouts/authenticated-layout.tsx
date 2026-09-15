import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/auth";
import { APP_ROUTES } from "../../app/router";
import { AuthSessionStatus } from "./auth-session-status";

export const AuthenticatedLayout = () => {
	const { user } = useAuth();

	return (
		<AuthSessionStatus>
			{user === null ? <Navigate to={APP_ROUTES.auth} replace /> : <Outlet />}
		</AuthSessionStatus>
	);
};
