import type { DocumentCreatePayload } from "@repo/api/schemas";
import { decodeDocumentDateFromStorage } from "@repo/common/helpers";
import { useQuery } from "@tanstack/react-query";
import { getDocumentConfig } from "@/shared/config/document-config";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import type { RecordKind } from "@/shared/types/record-kind";

type UseDocumentProps = {
	kind: RecordKind;
	documentId?: string;
};

export function useDocument({ kind, documentId }: UseDocumentProps) {
	const config = getDocumentConfig(kind);

	const query = useQuery({
		queryKey: config.queryKeys.single(documentId ?? ""),
		enabled: Boolean(documentId),
		queryFn: async () => {
			return controlledAsync(() =>
				config.client.get({
					id: documentId ?? "",
				}),
			);
		},
		select: (response): DocumentCreatePayload => ({
			date: decodeDocumentDateFromStorage(response.data.date),
			lineItems: response.data.lineItems,
		}),
	});

	return {
		data: query.data,
		isLoading: useSkeletonLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
}
