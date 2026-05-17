import type { DocumentListResponse } from "@repo/api/schemas";
import { useQuery } from "@tanstack/react-query";
import { getDocumentConfig } from "@/features/document/model/document-config";
import type { RecordKind } from "@/features/document/model/record-kind";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";

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
		isLoading: useSkeletonLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
}
