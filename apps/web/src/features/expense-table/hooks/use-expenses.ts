import type {
	ExpenseDocumentListItem,
	ExpenseDocumentListResponse,
} from "@repo/api/schemas";
import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export function useExpenses() {
	return useQuery<
		ExpenseDocumentListResponse,
		Error,
		ExpenseDocumentListItem[]
	>({
		queryKey: queryKeys.expenses.all(),
		queryFn: async (): Promise<ExpenseDocumentListResponse> => {
			return controlledAsync(() => orpcClient.expenses.list({}));
		},
		select: (response) => response.data,
	});
}
