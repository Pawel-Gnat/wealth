import type { ExpenseDocumentDeleteResponse } from "@repo/api/schemas";
import * as Sentry from "@sentry/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseDeleteExpenseProps = {
	onSuccess?: (data: ExpenseDocumentDeleteResponse) => void;
	onError?: (error: Error) => void;
};

export const useDeleteExpense = ({
	onSuccess,
	onError,
}: UseDeleteExpenseProps = {}) => {
	const queryClient = useQueryClient();

	const mutation = useMutation<ExpenseDocumentDeleteResponse, Error, string>({
		mutationFn: (expenseId) =>
			controlledAsync(() => orpcClient.expenses.delete({ id: expenseId })),
		onSuccess: (data) => {
			Sentry.logger.info("Expense delete succeeded", {
				log_source: "expenses_delete",
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.expenses.all(),
			});
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	return {
		deleteExpense: mutation.mutate,
		isLoading: useSkeletonLoader({ isLoading: mutation.isPending }),
		deletingExpenseId: mutation.isPending ? mutation.variables : null,
	};
};
