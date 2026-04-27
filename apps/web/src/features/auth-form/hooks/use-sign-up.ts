import type { SignUpPayload, SignUpResponse } from "@repo/api/schemas";
import { useMutation } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";

import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseSignUpProps = {
	onSuccess?: (data: SignUpResponse) => void;
	onError?: (error: Error) => void;
};

export const useSignUp = ({ onSuccess, onError }: UseSignUpProps = {}) => {
	const mutation = useMutation<SignUpResponse, Error, SignUpPayload>({
		mutationFn: (payload) =>
			controlledAsync(() => orpcClient.user.signUp(payload)),
		onSuccess: (data) => {
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	return {
		signUp: mutation.mutate,
		isLoading: useSkeletonLoader({ isLoading: mutation.isPending }),
		isError: mutation.isError,
		error: mutation.error,
		data: mutation.data,
	};
};
