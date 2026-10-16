import { useNavigation } from "react-router";
import { useRouteChunkLoad } from "@/context/route-chunk-load";
import { RouteLoadingBar } from "./route-loading-bar";

export const ChunkLoadingBar = () => {
	const navigation = useNavigation();
	const { isRetrying } = useRouteChunkLoad();

	return (
		<RouteLoadingBar isLoading={navigation.state === "loading" || isRetrying} />
	);
};
