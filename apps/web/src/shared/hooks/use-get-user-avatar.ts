import { skipToken, useQuery } from "@tanstack/react-query";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export const useGetUserAvatar = (imageId: string | null | undefined) => {
	const query = useQuery({
		queryKey: queryKeys.userAvatar(imageId),
		queryFn: imageId
			? () => orpcClient.storage.get({ id: imageId })
			: skipToken,
	});

	return {
		url: query.data?.data.url ?? null,
		isLoading: query.isLoading,
		isError: query.isError,
	};
};
