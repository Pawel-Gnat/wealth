import type { DocumentListResponse } from "@repo/api/schemas";
import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export const useIncomes = () => {
	const query = useQuery({
		queryKey: queryKeys.incomes.all(),
		queryFn: async (): Promise<DocumentListResponse> => {
			return controlledAsync(() => orpcClient.incomes.list({}));
		},
		select: (response) => response.data,
	});

	return {
		data: query.data ?? [],
		isLoading: useSkeletonLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
};
