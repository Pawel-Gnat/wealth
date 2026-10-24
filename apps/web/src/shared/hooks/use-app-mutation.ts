import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { isTooManyRequests } from "@/shared/helpers/controlled-fetch";

export const useAppMutation = <
	TData = unknown,
	TError = Error,
	TVariables = void,
	TOnMutateResult = unknown,
>(
	options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
) => {
	const { onError, ...rest } = options;

	return useMutation({
		...rest,
		onError: (error, variables, onMutateResult, context) => {
			if (isTooManyRequests(error)) {
				return;
			}

			return onError?.(error, variables, onMutateResult, context);
		},
	});
};
