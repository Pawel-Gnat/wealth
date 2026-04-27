import * as Sentry from "@sentry/react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

export const AUTH_TOKEN_STORAGE_KEY = "wealth.auth.token";

type AuthContextValue = {
	isAuthenticated: boolean;
	storeToken: (token: string) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredToken(): string | null {
	try {
		return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
	} catch {
		return null;
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(() =>
		typeof window !== "undefined" ? readStoredToken() : null,
	);

	const storeToken = useCallback((newToken: string) => {
		localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, newToken);
		setToken(newToken);
		Sentry.logger.info("Auth token stored", { log_source: "auth_session" });
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
		setToken(null);
		Sentry.logger.info("User logged out", { log_source: "auth_session" });
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			isAuthenticated: Boolean(token),
			storeToken,
			logout,
		}),
		[token, storeToken, logout],
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
