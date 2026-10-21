import { Outlet } from "react-router";
import { NavigationLoadingBar } from "@/shared/widgets/route-loading";

export const RootLayout = () => {
	return (
		<>
			<NavigationLoadingBar />
			<Outlet />
		</>
	);
};
