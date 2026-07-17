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
import { bootstrapSession, logoutSession } from "@/shared/lib/auth/auth-api";
import { configureAuthSession } from "@/shared/lib/auth/auth-session";

type AuthContextValue = {
	isAuthenticated: boolean;
	isAuthLoading: boolean;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAuthLoading, setIsAuthLoading] = useState(true);

	useEffect(() => {
		configureAuthSession({
			onTokenRefreshed: () => {
				setIsAuthenticated(true);
			},
			onUnauthorized: () => {
				setIsAuthenticated(false);
				queryClient.clear();
			},
		});
	}, [queryClient]);

	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const hasSession = await bootstrapSession();
				setIsAuthenticated(hasSession);
			} finally {
				setIsAuthLoading(false);
			}
		};

		void initializeAuth();
	}, []);

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
