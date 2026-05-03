import type { ExpenseDocumentListResponse } from "@repo/api/schemas";
import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export const useExpenses = () => {
	const query = useQuery({
		queryKey: queryKeys.expenses.all(),
		queryFn: async (): Promise<ExpenseDocumentListResponse> => {
			return controlledAsync(() => orpcClient.expenses.list({}));
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
