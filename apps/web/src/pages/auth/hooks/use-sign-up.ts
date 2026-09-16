import type { CreateUserPayload, CreateUserResponse } from "@repo/api/types";
import {
	AUTH_OBSERVABILITY_EVENTS,
	logger,
	runWithRequestId,
} from "@repo/observability/browser";
import { useMutation } from "@tanstack/react-query";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";

import { useLoader } from "@/shared/hooks/use-loader";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseSignUpProps = {
	onSuccess?: (data: CreateUserResponse) => void;
	onError?: (error: Error) => void;
};

export const useSignUp = ({ onSuccess, onError }: UseSignUpProps = {}) => {
	const mutation = useMutation<CreateUserResponse, Error, CreateUserPayload>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				const data = await controlledAsync(() =>
					orpcClient.user.signUp(payload),
				);
				logger.info(AUTH_OBSERVABILITY_EVENTS.signUpSucceeded);
				return data;
			}),
		onSuccess: (data) => {
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	return {
		signUp: mutation.mutate,
		isLoading: useLoader({ isLoading: mutation.isPending }),
		isError: mutation.isError,
		error: mutation.error,
		data: mutation.data,
	};
};
