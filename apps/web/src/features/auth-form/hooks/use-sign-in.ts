import type { SignInPayload, SignInResponse } from "@repo/api/schemas";
import { useMutation } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";

import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseSignInProps = {
	onSuccess?: (data: SignInResponse) => void;
	onError?: (error: Error) => void;
};

export const useSignIn = ({ onSuccess, onError }: UseSignInProps = {}) => {
	const mutation = useMutation<SignInResponse, Error, SignInPayload>({
		mutationFn: (payload) => controlledAsync(() => orpcClient.signIn(payload)),
		onSuccess: (data) => {
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	return {
		signIn: mutation.mutateAsync,
		isLoading: useSkeletonLoader({ isLoading: mutation.isPending }),
		isError: mutation.isError,
		error: mutation.error,
		data: mutation.data,
	};
};
