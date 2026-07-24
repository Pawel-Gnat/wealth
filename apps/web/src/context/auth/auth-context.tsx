import * as Sentry from "@sentry/react";
import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useSkeletonLoader } from "@/shared/hooks/use-skeleton-loader";
import { bootstrapSession, logoutSession } from "@/shared/lib/auth/auth-api";
import { configureAuthSession } from "@/shared/lib/auth/auth-session";
import { initAuthTabSync } from "@/shared/lib/auth/refresh-access-token";
import { startSseGateway, stopSseGateway } from "@/shared/lib/sse";

type AuthContextValue = {
	isAuthenticated: boolean;
	isAuthLoading: boolean;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isResolvingSession, setIsResolvingSession] = useState(true);
	const isAuthLoading = useSkeletonLoader({
		isLoading: isResolvingSession,
		delay: 0,
	});

	useEffect(() => {
		let cancelled = false;

		configureAuthSession({
			onTokenRefreshed: () => {
				setIsAuthenticated(true);
				startSseGateway();
			},
			onUnauthorized: () => {
				stopSseGateway();
				setIsAuthenticated(false);
				queryClient.clear();
			},
		});

		const stopTabSync = initAuthTabSync();

		const initializeAuth = async () => {
			try {
				const hasSession = await bootstrapSession();
				if (!cancelled) {
					setIsAuthenticated(hasSession);
				}
			} finally {
				if (!cancelled) {
					setIsResolvingSession(false);
				}
			}
		};

		void initializeAuth();

		return () => {
			cancelled = true;
			configureAuthSession({});
			stopTabSync();
			stopSseGateway();
		};
	}, [queryClient]);

	const logout = useCallback(async () => {
		await logoutSession();
		Sentry.logger.info("User logged out", { log_source: "auth_session" });
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			isAuthenticated,
			isAuthLoading,
			logout,
		}),
		[isAuthenticated, isAuthLoading, logout],
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
