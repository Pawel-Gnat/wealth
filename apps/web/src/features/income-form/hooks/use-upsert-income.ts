import {
	type DocumentCreatePayload,
	type DocumentUpdatePayload,
	INCOME_UPDATED_MESSAGE,
	type IncomeDocumentCreateResponse,
	type IncomeDocumentUpdateResponse,
} from "@repo/api/schemas";
import * as Sentry from "@sentry/react";
import { useMutation } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseUpsertIncomeProps = {
	onSuccess?: (
		data: IncomeDocumentCreateResponse | IncomeDocumentUpdateResponse,
	) => void;
	onError?: (error: Error) => void;
};

export const useUpsertIncome = ({
	onSuccess,
	onError,
}: UseUpsertIncomeProps = {}) => {
	const mutation = useMutation<
		IncomeDocumentCreateResponse | IncomeDocumentUpdateResponse,
		Error,
		DocumentCreatePayload | DocumentUpdatePayload
	>({
		mutationFn: (payload) => {
			if ("id" in payload) {
				const { id, ...updatePayload } = payload;
				return controlledAsync(() =>
					orpcClient.incomes.update({ id, ...updatePayload }),
				);
			}
			return controlledAsync(() => orpcClient.incomes.create(payload));
		},
		onSuccess: (data) => {
			const isUpdated = data.data.message === INCOME_UPDATED_MESSAGE;
			Sentry.logger.info(
				isUpdated ? "Income update succeeded" : "Income create succeeded",
				{
					log_source: isUpdated ? "incomes_update" : "incomes_create",
				},
			);
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	return {
		upsertIncome: mutation.mutate,
		isLoading: useSkeletonLoader({ isLoading: mutation.isPending }),
		isError: mutation.isError,
		error: mutation.error,
		data: mutation.data,
	};
};
