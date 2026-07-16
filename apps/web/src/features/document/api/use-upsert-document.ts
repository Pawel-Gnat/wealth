import type {
	DocumentCreatePayload,
	DocumentUpdatePayload,
	ExpenseDocumentCreateResponse,
	ExpenseDocumentUpdateResponse,
	IncomeDocumentCreateResponse,
	IncomeDocumentUpdateResponse,
} from "@repo/api/schemas";
import { normalizeDocumentDateForApi } from "@repo/common/helpers";
import * as Sentry from "@sentry/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocumentConfig } from "@/features/document/model/document-config";
import type { RecordKind } from "@/features/document/model/record-kind";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type DocumentUpsertResponse =
	| ExpenseDocumentCreateResponse
	| ExpenseDocumentUpdateResponse
	| IncomeDocumentCreateResponse
	| IncomeDocumentUpdateResponse;

export type UseUpsertDocumentProps = {
	kind: RecordKind;
	onSuccess?: (data: DocumentUpsertResponse) => void;
	onError?: (error: Error) => void;
};

export function useUpsertDocument({
	kind,
	onSuccess,
	onError,
}: UseUpsertDocumentProps) {
	const config = getDocumentConfig(kind);
	const queryClient = useQueryClient();

	const mutation = useMutation<
		DocumentUpsertResponse,
		Error,
		DocumentCreatePayload | DocumentUpdatePayload
	>({
		mutationFn: async (payload) => {
			const normalizedPayload = {
				...payload,
				date: normalizeDocumentDateForApi(payload.date),
			};

			if ("id" in normalizedPayload) {
				const { id, ...updatePayload } = normalizedPayload;
				return controlledAsync<DocumentUpsertResponse>(async () =>
					config.client.update({ id, ...updatePayload }),
				);
			}
			return controlledAsync<DocumentUpsertResponse>(async () =>
				config.client.create(normalizedPayload),
			);
		},
		onSuccess: (data) => {
			const isUpdated = data.data.message === config.updatedMessage;
			Sentry.logger.info(
				isUpdated ? `${kind} update succeeded` : `${kind} create succeeded`,
				{
					log_source: isUpdated
						? config.logSource.update
						: config.logSource.create,
				},
			);
			void queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.all(),
			});
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	return {
		upsertDocument: mutation.mutate,
		isLoading: useSkeletonLoader({ isLoading: mutation.isPending }),
		isError: mutation.isError,
		error: mutation.error,
		data: mutation.data,
	};
}
