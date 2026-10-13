import type { BudgetInvitesResponse } from "@repo/api/types";
import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useLoader } from "@/shared/hooks/use-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export const useBudgetInvites = () => {
	const query = useQuery({
		queryKey: queryKeys.budgets.invites(),
		queryFn: (): Promise<BudgetInvitesResponse> =>
			controlledAsync(() => orpcClient.budget.invites({})),
		select: (response) => response.data,
	});

	return {
		data: query.data,
		isLoading: useLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
};
