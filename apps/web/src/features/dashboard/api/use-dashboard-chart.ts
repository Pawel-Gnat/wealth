import { useQuery } from "@tanstack/react-query";
import type { ChartPeriod } from "@/features/dashboard/model/chart-period";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseDashboardChartProps = {
	chartPeriod: ChartPeriod;
};

export const useDashboardChart = ({ chartPeriod }: UseDashboardChartProps) => {
	const query = useQuery({
		queryKey: queryKeys.dashboard.chart(chartPeriod),
		queryFn: async () => {
			return controlledAsync(() =>
				orpcClient.dashboard.getChart({ chartPeriod }),
			);
		},
		select: (response) => response.data,
	});

	return {
		data: query.data,
		isLoading: useSkeletonLoader({ isLoading: query.isPending }),
		isError: query.isError,
		error: query.error,
	};
};
