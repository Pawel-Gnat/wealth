import type { RecordListResponse } from "@repo/api/types";
import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useLoader } from "@/shared/hooks/use-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseRecordsListProps = {
	budgetId?: string;
};

export const useRecordsList = ({ budgetId }: UseRecordsListProps = {}) => {
	const query = useQuery({
		queryKey: queryKeys.records.list(budgetId),
		queryFn: async (): Promise<RecordListResponse> => {
			return controlledAsync(() =>
				orpcClient.records.list(budgetId ? { budgetId } : {}),
			);
		},
		select: (response) => response.data,
	});

	return {
		data: query.data ?? [],
		isLoading: useLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
};
