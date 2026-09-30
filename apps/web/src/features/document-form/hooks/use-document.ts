import type { RecordDetails } from "@repo/api/types";
import { decodeDocumentDateFromStorage } from "@repo/common/helpers";
import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useLoader } from "@/shared/hooks/use-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseDocumentProps = {
	documentId?: string;
};

export function useDocument({ documentId }: UseDocumentProps) {
	const query = useQuery({
		queryKey: queryKeys.records.single(documentId ?? ""),
		enabled: Boolean(documentId),
		queryFn: async () => {
			return controlledAsync(() =>
				orpcClient.records.get({
					id: documentId ?? "",
				}),
			);
		},
		select: (response): RecordDetails => ({
			id: response.data.id,
			date: decodeDocumentDateFromStorage(response.data.date),
			kind: response.data.kind,
			totalAmount: response.data.totalAmount,
			lineItems: response.data.lineItems,
		}),
	});

	return {
		data: query.data,
		isLoading: useLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
}
