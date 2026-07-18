import type { SignInPayload, SignInResponse } from "@repo/api/schemas";
import * as Sentry from "@sentry/react";
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
		mutationFn: (payload) =>
			controlledAsync(() => orpcClient.user.signIn(payload)),
		onSuccess: (data) => {
			Sentry.logger.info("Sign in succeeded", { log_source: "auth_sign_in" });
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
