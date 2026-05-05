import type {
	DocumentCreatePayload,
	DocumentCreateResponse,
} from "@repo/api/schemas";
import * as Sentry from "@sentry/react";
import { useMutation } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseInsertExpenseProps = {
	onSuccess?: (data: DocumentCreateResponse) => void;
	onError?: (error: Error) => void;
};

export const useInsertExpense = ({
	onSuccess,
	onError,
}: UseInsertExpenseProps = {}) => {
	const mutation = useMutation<
		DocumentCreateResponse,
		Error,
		DocumentCreatePayload
	>({
		mutationFn: (payload) =>
			controlledAsync(() => orpcClient.expenses.create(payload)),
		onSuccess: (data) => {
			Sentry.logger.info("Expense create succeeded", {
				log_source: "expenses_create",
			});
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	return {
		insertExpense: mutation.mutate,
		isLoading: useSkeletonLoader({ isLoading: mutation.isPending }),
		isError: mutation.isError,
		error: mutation.error,
		data: mutation.data,
	};
};
