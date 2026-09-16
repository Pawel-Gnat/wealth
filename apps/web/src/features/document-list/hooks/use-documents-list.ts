import type { DocumentListResponse } from "@repo/api/types";
import { useQuery } from "@tanstack/react-query";
import { getDocumentConfig } from "@/features/config/document-config";
import type { RecordKind } from "@/features/model/record-kind";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useLoader } from "@/shared/hooks/use-loader";

export function useDocumentsList(kind: RecordKind) {
	const config = getDocumentConfig(kind);

	const query = useQuery({
		queryKey: config.queryKeys.all(),
		queryFn: async (): Promise<DocumentListResponse> => {
			return controlledAsync(() => config.client.list({}));
		},
		select: (response) => response.data,
	});

	return {
		data: query.data ?? [],
		isLoading: useLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
}
