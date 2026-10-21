import { useNavigation } from "react-router";
import { LoadingBar } from "./loading-bar";

export const NavigationLoadingBar = () => {
	const navigation = useNavigation();

	return <LoadingBar isLoading={navigation.state === "loading"} />;
};
