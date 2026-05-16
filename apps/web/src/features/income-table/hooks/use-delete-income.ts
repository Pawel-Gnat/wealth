import type { IncomeDocumentDeleteResponse } from "@repo/api/schemas";
import * as Sentry from "@sentry/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseDeleteIncomeProps = {
	onSuccess?: (data: IncomeDocumentDeleteResponse) => void;
	onError?: (error: Error) => void;
};

export const useDeleteIncome = ({
	onSuccess,
	onError,
}: UseDeleteIncomeProps = {}) => {
	const queryClient = useQueryClient();

	const mutation = useMutation<IncomeDocumentDeleteResponse, Error, string>({
		mutationFn: (incomeId) =>
			controlledAsync(() => orpcClient.incomes.delete({ id: incomeId })),
		onSuccess: (data) => {
			Sentry.logger.info("Income delete succeeded", {
				log_source: "incomes_delete",
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.incomes.all(),
			});
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	return {
		deleteIncome: mutation.mutate,
		isLoading: useSkeletonLoader({ isLoading: mutation.isPending }),
		deletingIncomeId: mutation.isPending ? mutation.variables : null,
	};
};
