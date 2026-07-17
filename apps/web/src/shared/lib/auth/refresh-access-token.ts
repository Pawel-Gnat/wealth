import { createBroadcastBus } from "@/shared/helpers/broadcast-bus";
import { delay } from "@/shared/helpers/delay";
import {
	getAccessToken,
	persistAccessToken,
} from "@/shared/lib/auth/auth-session";
import { refreshAccessTokenRaw } from "@/shared/lib/auth/refresh-access-token-raw";

const LOCK_NAME = "wealth.auth.refresh";
const CHANNEL_NAME = "wealth.auth";
const PEER_FRESH_MS = 5_000;
const REFRESH_RETRY_DELAY_MS = 150;

type AccessTokenMessage = {
	type: "access-token";
	token: string;
};

const isAccessTokenMessage = (data: unknown): data is AccessTokenMessage => {
	if (typeof data !== "object" || data === null) {
		return false;
	}

	const message = data as Partial<AccessTokenMessage>;
	return message.type === "access-token" && typeof message.token === "string";
};

const accessTokenBus = createBroadcastBus(CHANNEL_NAME, isAccessTokenMessage);

let refreshPromise: Promise<string | null> | null = null;
let lastPeerRefreshAt = 0;
let stopListening: (() => void) | null = null;

const ensurePeerListener = (): void => {
	if (stopListening) {
		return;
	}

	stopListening = accessTokenBus.subscribe((message) => {
		persistAccessToken(message.token);
		lastPeerRefreshAt = Date.now();
	});
};

const hasFreshPeerToken = (): boolean => {
	return (
		Date.now() - lastPeerRefreshAt < PEER_FRESH_MS && getAccessToken() !== null
	);
};

const attemptRefresh = async (): Promise<string | null> => {
	if (hasFreshPeerToken()) {
		return getAccessToken();
	}

	const token = await refreshAccessTokenRaw();
	if (!token) {
		return null;
	}

	lastPeerRefreshAt = Date.now();
	accessTokenBus.publish({ type: "access-token", token });
	return token;
};

const refreshWithRetry = async (): Promise<string | null> => {
	ensurePeerListener();

	const firstAttempt = await attemptRefresh();
	if (firstAttempt) {
		return firstAttempt;
	}

	await delay(REFRESH_RETRY_DELAY_MS);

	if (hasFreshPeerToken()) {
		return getAccessToken();
	}

	return attemptRefresh();
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

	return withRefreshMutex(refreshWithRetry);
};
