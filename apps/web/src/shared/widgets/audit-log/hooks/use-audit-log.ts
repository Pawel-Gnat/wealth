import type { AuditListResponse, AuditsParams } from "@repo/api/types";
import { useQuery } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useLoader } from "@/shared/hooks/use-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export const useAuditLog = (params: AuditsParams) => {
	const query = useQuery({
		queryKey: queryKeys.audits.list(params),
		queryFn: async (): Promise<AuditListResponse> => {
			return controlledAsync(() => orpcClient.audits.list(params));
		},
		select: (response) => response.data,
	});

	return {
		data: query.data ?? [],
		isLoading: useLoader({ isLoading: query.isPending }),
		isError: query.isError,
	};
};
