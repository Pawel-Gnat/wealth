import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/auth";
import { APP_ROUTES } from "../../app/router";

export const UnauthenticatedLayout = () => {
	const { isAuthenticated } = useAuth();

	if (isAuthenticated) {
		return <Navigate to={APP_ROUTES.dashboard} replace />;
	}

	return (
		<main className="flex h-svh w-full items-center justify-center  p-4 md:p-6">
			<Outlet />
		</main>
	);
};
