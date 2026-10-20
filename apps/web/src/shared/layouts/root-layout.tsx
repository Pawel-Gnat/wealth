import { Outlet } from "react-router";
import { ChunkLoadingBar } from "@/shared/widgets/route-chunk";

export const RootLayout = () => {
	return (
		<>
			<ChunkLoadingBar />
			<Outlet />
		</>
	);
};
