import type { ChartDays } from "@repo/api/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseDashboardDailyChartProps = {
	days: ChartDays;
};

export const useDashboardDailyChart = ({
	days,
}: UseDashboardDailyChartProps) => {
	const query = useQuery({
		queryKey: queryKeys.dashboard.dailyChart(days),
		queryFn: async () => {
			return controlledAsync(() =>
				orpcClient.dashboard.getDailyChart({ days }),
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
