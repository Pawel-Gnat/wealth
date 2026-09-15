import type { SessionSnapshotResponse, SignInPayload } from "@repo/api/schemas";
import {
	AUTH_OBSERVABILITY_EVENTS,
	logger,
	runWithRequestId,
} from "@repo/observability/browser";
import { useMutation } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { applySessionSnapshot } from "@/shared/lib/auth/auth-session";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseSignInProps = {
	onSuccess?: (data: SessionSnapshotResponse) => void;
	onError?: (error: Error) => void;
};

export const useSignIn = ({ onSuccess, onError }: UseSignInProps = {}) => {
	const mutation = useMutation<SessionSnapshotResponse, Error, SignInPayload>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				const data = await controlledAsync(() =>
					orpcClient.user.signIn(payload),
				);
				logger.info(AUTH_OBSERVABILITY_EVENTS.signInSucceeded);
				return data;
			}),
		onSuccess: (data) => {
			applySessionSnapshot(data.data);
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	return {
		signIn: mutation.mutate,
		isLoading: useSkeletonLoader({ isLoading: mutation.isPending }),
		isError: mutation.isError,
		error: mutation.error,
		data: mutation.data,
	};
};
