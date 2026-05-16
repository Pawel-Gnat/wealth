import type { DocumentCreatePayload } from "@repo/api/schemas";
import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseIncomeProps = {
	incomeId?: string;
};

export const useIncome = ({ incomeId }: UseIncomeProps) => {
	const query = useQuery({
		queryKey: queryKeys.incomes.single(incomeId ?? ""),
		enabled: Boolean(incomeId),
		queryFn: async () => {
			return controlledAsync(() =>
				orpcClient.incomes.get({
					id: incomeId ?? "",
				}),
			);
		},
		select: (response): DocumentCreatePayload => ({
			date: new Date(response.data.date),
			lineItems: response.data.lineItems,
		}),
	});

	return {
		data: query.data,
		isLoading: useSkeletonLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
};
