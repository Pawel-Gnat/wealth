import * as Sentry from "@sentry/react";
import { createBroadcastBus } from "@/shared/helpers/broadcast-bus";
import { delay } from "@/shared/helpers/delay";
import { clearAuthSession } from "@/shared/lib/auth/auth-session";
import { refreshAccessTokenRaw } from "@/shared/lib/auth/refresh-access-token-raw";

const LOCK_NAME = "wealth.auth.refresh";
const CHANNEL_NAME = "wealth.auth";
const PEER_FRESH_MS = 5_000;
const REFRESH_RETRY_DELAY_MS = 150;

type AuthBusMessage = { type: "refresh-done" } | { type: "clear" };

const isAuthBusMessage = (data: unknown): data is AuthBusMessage => {
	if (typeof data !== "object" || data === null) {
		return false;
	}

	const message = data as Partial<AuthBusMessage>;
	return message.type === "refresh-done" || message.type === "clear";
};

const authBus = createBroadcastBus(CHANNEL_NAME, isAuthBusMessage);

let refreshPromise: Promise<string | null> | null = null;
let lastPeerRefreshAt = 0;
let stopListening: (() => void) | null = null;

const hasFreshPeerRefresh = (): boolean => {
	return Date.now() - lastPeerRefreshAt < PEER_FRESH_MS;
};

const markRefreshDone = (): void => {
	lastPeerRefreshAt = Date.now();
	authBus.publish({ type: "refresh-done" });
};

const attemptRefresh = async (): Promise<string | null> => {
	const token = await refreshAccessTokenRaw();
	if (!token) {
		return null;
	}

	markRefreshDone();
	return token;
};

const refreshWithRetry = async (): Promise<string | null> => {
	const firstAttempt = await attemptRefresh();
	if (firstAttempt) {
		return firstAttempt;
	}

	if (!hasFreshPeerRefresh()) {
		await delay(REFRESH_RETRY_DELAY_MS);
	}

	return attemptRefresh();
};

export const initAuthTabSync = (): (() => void) => {
	if (!stopListening) {
		stopListening = authBus.subscribe((message) => {
			if (message.type === "refresh-done") {
				lastPeerRefreshAt = Date.now();
				return;
			}

			clearAuthSession();
		});
	}

	return () => {
		stopListening?.();
		stopListening = null;
	};
};

export const clearAuthSessionAcrossTabs = (): void => {
	clearAuthSession();
	authBus.publish({ type: "clear" });
};

export const resetRefreshMutex = (): void => {
	refreshPromise = null;
};

export const withRefreshMutex = async (
	refresh: () => Promise<string | null>,
): Promise<string | null> => {
	if (!refreshPromise) {
		refreshPromise = refresh().finally(() => {
			refreshPromise = null;
		});
	}

	return refreshPromise;
};

export const refreshAccessToken = async (): Promise<string | null> => {
	if (typeof navigator !== "undefined" && navigator.locks?.request) {
		return navigator.locks.request(LOCK_NAME, refreshWithRetry);
	}

	Sentry.logger.warn(
		"Web Locks API unavailable; auth refresh uses per-tab mutex",
		{
			log_source: "auth_refresh",
		},
	);

	return withRefreshMutex(refreshWithRetry);
};
