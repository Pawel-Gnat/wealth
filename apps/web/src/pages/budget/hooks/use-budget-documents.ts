import type { BudgetDocumentsResponse, DocumentKind } from "@repo/api/types";
import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useLoader } from "@/shared/hooks/use-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseBudgetDocumentsProps = {
	id: string | undefined;
	kind?: DocumentKind;
};

export const useBudgetDocuments = ({ id, kind }: UseBudgetDocumentsProps) => {
	const query = useQuery({
		queryKey: queryKeys.budgets.documents(id ?? "", kind),
		enabled: Boolean(id),
		queryFn: (): Promise<BudgetDocumentsResponse> => {
			if (!id) {
				throw new Error("Budget id is required");
			}

			return controlledAsync(() =>
				orpcClient.budget.documents({
					id,
					...(kind ? { kind } : {}),
				}),
			);
		},
		select: (response) => response.data,
	});

	return {
		data: query.data,
		isLoading: useLoader({ isLoading: query.isLoading }),
		isError: query.isError,
		error: query.error,
	};
};
