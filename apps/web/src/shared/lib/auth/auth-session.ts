type AuthSessionHandlers = {
	onTokenRefreshed?: (token: string) => void;
	onUnauthorized?: () => void;
};

let accessToken: string | null = null;
let onTokenRefreshed: ((token: string) => void) | undefined;
let onUnauthorized: (() => void) | undefined;

export const configureAuthSession = (next: AuthSessionHandlers): void => {
	onTokenRefreshed = next.onTokenRefreshed;
	onUnauthorized = next.onUnauthorized;
};

export const getAccessToken = (): string | null => accessToken;

export const persistAccessToken = (token: string): void => {
	accessToken = token;
	onTokenRefreshed?.(token);
};

export const clearAuthSession = (): void => {
	accessToken = null;
	onUnauthorized?.();
};
