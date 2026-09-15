import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/auth";
import { PageLoader } from "@/shared/widgets/page-loader";
import { APP_ROUTES } from "../../app/router";

export const UnauthenticatedLayout = () => {
	const { user, isAuthLoading } = useAuth();

	if (isAuthLoading) {
		return <PageLoader />;
	}

	if (user !== null) {
		return <Navigate to={APP_ROUTES.dashboard} replace />;
	}

	return <Outlet />;
};
