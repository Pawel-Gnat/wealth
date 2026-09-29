import { USER_SEARCH_QUERY_MIN_LENGTH } from "@repo/api/schemas";
import type { UserSearchResponse } from "@repo/api/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useLoader } from "@/shared/hooks/use-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export const useSearchUsers = (query: string) => {
	const trimmed = query.trim();
	const enabled = trimmed.length >= USER_SEARCH_QUERY_MIN_LENGTH;

	const result = useQuery({
		queryKey: queryKeys.users.search(trimmed),
		queryFn: (): Promise<UserSearchResponse> =>
			controlledAsync(() => orpcClient.user.search({ query: trimmed })),
		enabled,
		placeholderData: keepPreviousData,
		select: (response) => ({
			users: response.data,
			hasMore: response.hasMore,
		}),
	});

	return {
		users: enabled ? (result.data?.users ?? []) : [],
		hasMore: enabled && (result.data?.hasMore ?? false),
		hasData: enabled && result.data !== undefined,
		isLoading: useLoader({ isLoading: result.isFetching }),
		isError: result.isError,
	};
};
