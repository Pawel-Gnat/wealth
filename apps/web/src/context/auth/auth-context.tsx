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
	login: (token: string) => void;
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

	const login = useCallback((newToken: string) => {
		localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, newToken);
		setToken(newToken);
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
		setToken(null);
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			isAuthenticated: Boolean(token),
			login,
			logout,
		}),
		[token, login, logout],
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
