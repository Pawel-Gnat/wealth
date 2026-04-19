import type { SignInPayload } from "@repo/api/schemas";
import { useCallback, useState } from "react";

import { useAuth } from "@/context/auth";
import { signInOrpcClient } from "@/shared/config/orpc-sign-in-client";

export function useSignIn() {
	const { login } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const reset = useCallback(() => {
		setError(null);
	}, []);

	const signIn = useCallback(
		async (payload: SignInPayload) => {
			setError(null);
			setIsLoading(true);
			try {
				const { data } = await signInOrpcClient.signIn(payload);
				login(data.token);
			} catch (unknownError) {
				const err =
					unknownError instanceof Error
						? unknownError
						: new Error(String(unknownError));
				setError(err);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[login],
	);

	return { signIn, isLoading, error, reset };
}
