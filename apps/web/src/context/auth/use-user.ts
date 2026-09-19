import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";
import { useAuth } from "./auth-context";

export const useUser = () => {
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: queryKeys.me(),
		queryFn: async () => {
			const response = await controlledAsync(() => orpcClient.user.me());
			return response.data.user;
		},
		enabled: isAuthenticated,
		staleTime: Infinity,
	});
};
