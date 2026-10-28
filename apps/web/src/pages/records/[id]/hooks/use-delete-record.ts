import type { RecordDeleteResponse, RecordKind } from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useQueryClient } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useAppMutation } from "@/shared/hooks/use-app-mutation";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";
import { getRecordConfig } from "../../config/record-config";

export type UseDeleteRecordProps = {
	kind: RecordKind;
	onSuccess?: (data: RecordDeleteResponse) => void;
	onError?: (error: Error) => void;
};

export const useDeleteRecord = ({
	kind,
	onSuccess,
	onError,
}: UseDeleteRecordProps) => {
	const config = getRecordConfig(kind);
	const queryClient = useQueryClient();

	const mutation = useAppMutation<RecordDeleteResponse, Error, string>({
		mutationFn: (recordId) =>
			runWithRequestId(async () => {
				return await controlledAsync<RecordDeleteResponse>(async () =>
					config.client.delete({ id: recordId, kind }),
				);
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
		deleteRecord: mutation.mutate,
		isLoading: mutation.isPending,
	};
};
