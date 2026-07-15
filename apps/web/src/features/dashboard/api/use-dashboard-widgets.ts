import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export const useDashboardWidgets = () => {
	const query = useQuery({
		queryKey: queryKeys.dashboard.widgets(),
		queryFn: async () => {
			return controlledAsync(() => orpcClient.dashboard.getWidgets());
		},
		select: (response) => response.data,
	});

	return {
		data: query.data,
		isLoading: useSkeletonLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
};
