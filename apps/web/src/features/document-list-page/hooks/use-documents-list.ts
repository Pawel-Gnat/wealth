import type { DocumentListResponse } from "@repo/api/schemas";
import { useQuery } from "@tanstack/react-query";
import { getDocumentConfig } from "@/shared/config/document-config";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import type { RecordKind } from "@/shared/types/record-kind";

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
