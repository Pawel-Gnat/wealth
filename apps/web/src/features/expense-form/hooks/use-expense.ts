import type { DocumentUpsertPayload } from "@repo/api/schemas";
import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseExpenseProps = {
	expenseId?: string;
};

export const useExpense = ({ expenseId }: UseExpenseProps) => {
	const query = useQuery({
		queryKey: queryKeys.expenses.single(expenseId ?? ""),
		enabled: Boolean(expenseId),
		queryFn: async () => {
			return controlledAsync(() =>
				orpcClient.expenses.get({
					id: expenseId ?? "",
				}),
			);
		},
		select: (response): Omit<DocumentUpsertPayload, "id"> => ({
			date: new Date(response.data.date),
			lineItems: response.data.lineItems,
		}),
	});

	return {
		data: query.data,
		isLoading: useSkeletonLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
};
