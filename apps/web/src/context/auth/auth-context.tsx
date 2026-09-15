import type { SessionSnapshot, User } from "@repo/api/schemas";
import {
	AUTH_OBSERVABILITY_EVENTS,
	logger,
	runWithRequestId,
} from "@repo/observability/browser";
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
import {
	bootstrapSession,
	getSessionRefreshDelayMs,
	logoutSession,
	refreshSession,
} from "@/shared/lib/auth/auth-api";
import {
	applySessionSnapshot,
	configureAuthSession,
} from "@/shared/lib/auth/auth-session";
import { configureOrpcRefresh } from "@/shared/lib/orpc/orpc-transport";
import { startSseGateway, stopSseGateway } from "@/shared/lib/sse";

type AuthContextValue = {
	user: User | null;
	isAuthLoading: boolean;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [user, setUser] = useState<User | null>(null);
	const [isResolvingSession, setIsResolvingSession] = useState(true);
	const isAuthLoading = useSkeletonLoader({
		isLoading: isResolvingSession,
		delay: 0,
	});

	useEffect(() => {
		let cancelled = false;
		let refreshTimer: ReturnType<typeof setTimeout> | null = null;

		const clearRefreshTimer = () => {
			if (refreshTimer === null) {
				return;
			}

			clearTimeout(refreshTimer);
			refreshTimer = null;
		};

		const applySnapshot = (snapshot: SessionSnapshot) => {
			setUser(snapshot.user);
			startSseGateway();
			clearRefreshTimer();
			refreshTimer = setTimeout(() => {
				void refreshSession();
			}, getSessionRefreshDelayMs(snapshot.sessionExpiresAt));
		};

		configureOrpcRefresh(refreshSession);
		configureAuthSession({
			onSessionApplied: applySnapshot,
			onUnauthorized: () => {
				clearRefreshTimer();
				stopSseGateway();
				setUser(null);
				queryClient.clear();
			},
		});

		const initializeAuth = async () => {
			try {
				const snapshot = await bootstrapSession();
				if (!cancelled && snapshot) {
					applySessionSnapshot(snapshot);
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
			clearRefreshTimer();
			configureOrpcRefresh(null);
			configureAuthSession({});
			stopSseGateway();
		};
	}, [queryClient]);

	const logout = useCallback(async () => {
		await runWithRequestId(async () => {
			await logoutSession();
			logger.info(AUTH_OBSERVABILITY_EVENTS.logoutSucceeded);
		});
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			isAuthLoading,
			logout,
		}),
		[user, isAuthLoading, logout],
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
