import { offsetPagination } from "@repo/api/helpers";
import type { RecordListResponse, RecordType } from "@repo/api/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useLoader } from "@/shared/hooks/use-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseRecordsListProps = {
	budgetId?: string;
	page: number;
	limit: number;
	type?: RecordType;
};

export const useRecordsList = ({
	budgetId,
	page,
	limit,
	type,
}: UseRecordsListProps) => {
	const query = useQuery({
		queryKey: [...queryKeys.records.list(budgetId), page, limit, type],
		placeholderData: keepPreviousData,
		queryFn: async (): Promise<RecordListResponse> => {
			return controlledAsync(() =>
				orpcClient.records.list({
					page,
					limit,
					...(type ? { type } : {}),
					...(budgetId ? { budgetId } : {}),
				}),
			);
		},
	});

	return {
		data: query.data?.data ?? [],
		pagination:
			query.data?.pagination ?? offsetPagination({ page, total: 0, limit }),
		isLoading: useLoader({
			isLoading: query.isPending && query.data === undefined,
		}),
		isPlaceholderData: query.isPlaceholderData,
		isError: query.isError,
		error: query.error,
	};
};
