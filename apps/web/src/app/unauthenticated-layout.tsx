import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/auth";
import { ROUTES } from "@/shared/config/routes";

export function UnauthenticatedLayout() {
	const { isAuthenticated } = useAuth();

	if (isAuthenticated) {
		return <Navigate to={ROUTES.dashboard} replace />;
	}

	return <Outlet />;
}
