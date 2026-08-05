import type { ChartDays } from "@repo/api/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseDashboardCumulativeChartProps = {
	days: ChartDays;
};

export const useDashboardCumulativeChart = ({
	days,
}: UseDashboardCumulativeChartProps) => {
	const query = useQuery({
		queryKey: queryKeys.dashboard.cumulativeChart(days),
		queryFn: async () => {
			return controlledAsync(() =>
				orpcClient.dashboard.getCumulativeChart({ days }),
			);
		},
		select: (response) => response.data,
		placeholderData: keepPreviousData,
	});

	return {
		data: query.data,
		isLoading: useSkeletonLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
};
