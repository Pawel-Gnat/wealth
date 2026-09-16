import type {
	ExpenseDocumentDeleteResponse,
	IncomeDocumentDeleteResponse,
} from "@repo/api/types";
import { logger, runWithRequestId } from "@repo/observability/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocumentConfig } from "@/features/config/document-config";
import type { RecordKind } from "@/features/model/record-kind";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
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
			runWithRequestId(async () => {
				const data = await controlledAsync<DocumentDeleteResponse>(async () =>
					config.client.delete({ id: documentId }),
				);
				logger.info(config.events.delete);
				return data;
			}),
		onSuccess: (data) => {
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
		isLoading: mutation.isPending,
	};
}
