import type {
	ExpenseDocumentDeleteResponse,
	IncomeDocumentDeleteResponse,
} from "@repo/api/schemas";
import * as Sentry from "@sentry/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocumentConfig } from "@/features/document/model/document-config";
import type { RecordKind } from "@/features/document/model/record-kind";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type DocumentDeleteResponse =
	| ExpenseDocumentDeleteResponse
	| IncomeDocumentDeleteResponse;

export type UseDeleteDocumentProps = {
	kind: RecordKind;
	onSuccess?: (data: DocumentDeleteResponse) => void;
	onError?: (error: Error) => void;
};

export function useDeleteDocument({
	kind,
	onSuccess,
	onError,
}: UseDeleteDocumentProps) {
	const config = getDocumentConfig(kind);
	const queryClient = useQueryClient();

	const mutation = useMutation<DocumentDeleteResponse, Error, string>({
		mutationFn: (documentId) =>
			controlledAsync<DocumentDeleteResponse>(async () =>
				config.client.delete({ id: documentId }),
			),
		onSuccess: (data) => {
			Sentry.logger.info(`${kind} delete succeeded`, {
				log_source: config.logSource.delete,
			});
			void queryClient.invalidateQueries({
				queryKey: config.queryKeys.all(),
			});
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
		deleteDocument: mutation.mutate,
		isLoading: useSkeletonLoader({ isLoading: mutation.isPending }),
		deletingDocumentId: mutation.isPending ? mutation.variables : null,
	};
}
