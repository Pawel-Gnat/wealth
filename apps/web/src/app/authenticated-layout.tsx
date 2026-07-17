import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/auth";
import { PageLoader } from "@/widgets/page-loader";
import { APP_ROUTES } from "./router";

export function AuthenticatedLayout() {
	const { isAuthenticated, isAuthLoading } = useAuth();

	if (isAuthLoading) {
		return <PageLoader />;
	}

	if (!isAuthenticated) {
		return <Navigate to={APP_ROUTES.auth} replace />;
	}

	return <Outlet />;
}
