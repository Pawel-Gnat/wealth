import { useNavigation } from "react-router";
import { RouteLoadingBar } from "./route-loading-bar";

export const ChunkLoadingBar = () => {
	const navigation = useNavigation();

	return <RouteLoadingBar isLoading={navigation.state === "loading"} />;
};
