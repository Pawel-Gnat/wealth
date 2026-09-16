import type { Period } from "@repo/api/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useLoader } from "@/shared/hooks/use-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseDashboardDailyChartProps = {
	days: Period;
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
		isLoading: useLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
};
