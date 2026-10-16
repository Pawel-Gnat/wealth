import { Outlet } from "react-router";
import { RouteChunkLoadProvider } from "@/context/route-chunk-load";
import { ChunkLoadingBar } from "@/shared/widgets/route-chunk";

export const RootLayout = () => {
	return (
		<RouteChunkLoadProvider>
			<ChunkLoadingBar />
			<Outlet />
		</RouteChunkLoadProvider>
	);
};
