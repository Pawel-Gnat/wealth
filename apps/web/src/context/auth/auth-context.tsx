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
	useRef,
	useState,
} from "react";
import { useLoader } from "@/shared/hooks/use-loader";
import {
	applySessionSnapshot,
	bootstrapSession,
	configureAuth,
	getSessionRefreshDelayMs,
	logoutSession,
	refreshSession,
} from "@/shared/lib/auth/auth-api";
import { startSseGateway, stopSseGateway } from "@/shared/lib/sse";

type AuthContextValue = {
	user: User | null;
	isAuthLoading: boolean;
	isResolvingSession: boolean;
	isBootstrapError: boolean;
	retryBootstrap: () => void;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [user, setUser] = useState<User | null>(null);
	const [isResolvingSession, setIsResolvingSession] = useState(true);
	const [isBootstrapError, setIsBootstrapError] = useState(false);
	const isAuthLoading = useLoader({
		isLoading: isResolvingSession,
	});
	const initializeAuthRef = useRef<(() => Promise<void>) | null>(null);

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

		configureAuth({
			onApplied: applySnapshot,
			onCleared: () => {
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
				if (!cancelled) {
					setIsBootstrapError(false);
				}
			} catch {
				if (!cancelled) {
					setIsBootstrapError(true);
				}
			} finally {
				if (!cancelled) {
					setIsResolvingSession(false);
				}
			}
		};

		initializeAuthRef.current = initializeAuth;
		void initializeAuth();

		return () => {
			cancelled = true;
			initializeAuthRef.current = null;
			clearRefreshTimer();
			configureAuth({});
			stopSseGateway();
		};
	}, [queryClient]);

	const retryBootstrap = useCallback(() => {
		setIsResolvingSession(true);
		void initializeAuthRef.current?.();
	}, []);

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
			isResolvingSession,
			isBootstrapError,
			retryBootstrap,
			logout,
		}),
		[
			user,
			isAuthLoading,
			isResolvingSession,
			isBootstrapError,
			retryBootstrap,
			logout,
		],
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
