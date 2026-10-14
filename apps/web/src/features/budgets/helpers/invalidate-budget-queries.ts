import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export const invalidateBudgetQueries = (
	queryClient: QueryClient,
	budgetId: string,
) => {
	void queryClient.invalidateQueries({
		queryKey: queryKeys.budgets.all(),
	});
	void queryClient.invalidateQueries({
		queryKey: queryKeys.records.list(budgetId),
	});
};
