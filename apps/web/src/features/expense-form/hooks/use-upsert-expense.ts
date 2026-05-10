import type {
	DocumentCreatePayload,
	DocumentCreateResponse,
	DocumentUpdatePayload,
	DocumentUpdateResponse,
} from "@repo/api/schemas";
import { EXPENSE_UPDATED_MESSAGE } from "@repo/api/schemas";
import * as Sentry from "@sentry/react";
import { useMutation } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseUpsertExpenseProps = {
	onSuccess?: (data: DocumentCreateResponse | DocumentUpdateResponse) => void;
	onError?: (error: Error) => void;
};

export const useUpsertExpense = ({
	onSuccess,
	onError,
}: UseUpsertExpenseProps = {}) => {
	const mutation = useMutation<
		DocumentCreateResponse | DocumentUpdateResponse,
		Error,
		DocumentCreatePayload | DocumentUpdatePayload
	>({
		mutationFn: (payload) => {
			if ("id" in payload) {
				const { id, ...updatePayload } = payload;
				return controlledAsync(() =>
					orpcClient.expenses.update({ id, ...updatePayload }),
				);
			}
			return controlledAsync(() => orpcClient.expenses.create(payload));
		},
		onSuccess: (data) => {
			const isUpdated = data.data.message === EXPENSE_UPDATED_MESSAGE;
			Sentry.logger.info(
				isUpdated ? "Expense update succeeded" : "Expense create succeeded",
				{
					log_source: isUpdated ? "expenses_update" : "expenses_create",
				},
			);
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	return {
		upsertExpense: mutation.mutate,
		isLoading: useSkeletonLoader({ isLoading: mutation.isPending }),
		isError: mutation.isError,
		error: mutation.error,
		data: mutation.data,
	};
};
