import * as Sentry from "@sentry/react";
import { delay } from "@/shared/helpers/delay";
import {
	publishAuthTabSyncMessage,
	subscribeAuthTabSync,
} from "@/shared/lib/auth/auth-tab-sync";
import { refreshAccessTokenRaw } from "@/shared/lib/auth/refresh-access-token-raw";

const LOCK_NAME = "wealth.auth.refresh";
const PEER_FRESH_MS = 5_000;
const REFRESH_RETRY_DELAY_MS = 150;

let refreshPromise: Promise<string | null> | null = null;
let lastPeerRefreshAt = 0;
let stopListening: (() => void) | null = null;

const hasFreshPeerRefresh = (): boolean => {
	return Date.now() - lastPeerRefreshAt < PEER_FRESH_MS;
};

const markRefreshDone = (): void => {
	lastPeerRefreshAt = Date.now();
	publishAuthTabSyncMessage({ type: "refresh-done" });
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
		stopListening = subscribeAuthTabSync((message) => {
			if (message.type === "refresh-done") {
				lastPeerRefreshAt = Date.now();
				return;
			}

			void refreshAccessToken();
		});
	}

	return () => {
		stopListening?.();
		stopListening = null;
	};
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
