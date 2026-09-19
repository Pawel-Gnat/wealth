import type { User } from "@repo/api/types";
import {
	AUTH_OBSERVABILITY_EVENTS,
	logger,
	runWithRequestId,
} from "@repo/observability/browser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from "react";
import {
	applySessionSnapshot,
	bootstrapSession,
	configureAuth,
	logoutSession,
} from "@/shared/lib/auth/auth-api";
import { startSseGateway, stopSseGateway } from "@/shared/lib/sse";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type AuthContextValue = {
	isAuthenticated: boolean;
	isAuthLoading: boolean;
	isBootstrapError: boolean;
	retryBootstrap: () => void;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const fetchCurrentUser = async (): Promise<User | null> => {
	const snapshot = await bootstrapSession();
	if (!snapshot) {
		return null;
	}

	applySessionSnapshot(snapshot);
	return snapshot.user;
};

const meQueryOptions = {
	queryKey: queryKeys.me(),
	queryFn: fetchCurrentUser,
	staleTime: Infinity,
	retry: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();

	useEffect(() => {
		configureAuth({
			onApplied: (snapshot) => {
				queryClient.setQueryData(queryKeys.me(), snapshot.user);
				startSseGateway();
			},
			onCleared: () => {
				stopSseGateway();
				void queryClient.cancelQueries({ queryKey: queryKeys.me() });
				queryClient.setQueryData(queryKeys.me(), null);
				queryClient.removeQueries({
					predicate: (query) => query.queryKey[0] !== "me",
				});
			},
		});

		return () => {
			configureAuth({});
			stopSseGateway();
		};
	}, [queryClient]);

	const { refetch, data, isPending, isFetching, isError } =
		useQuery(meQueryOptions);
	const isAuthenticated = data != null;
	const isAuthLoading = isPending || (isFetching && isError);

	const retryBootstrap = useCallback(() => {
		void refetch();
	}, [refetch]);

	const logout = useCallback(async () => {
		await runWithRequestId(async () => {
			await logoutSession();
			logger.info(AUTH_OBSERVABILITY_EVENTS.logoutSucceeded);
		});
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			isAuthenticated,
			isAuthLoading,
			isBootstrapError: isError,
			retryBootstrap,
			logout,
		}),
		[isAuthenticated, isAuthLoading, isError, retryBootstrap, logout],
	);

	return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return ctx;
}

export const useUser = () => {
	return useQuery(meQueryOptions);
};
