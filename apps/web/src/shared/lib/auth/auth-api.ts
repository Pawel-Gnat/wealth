import type { SessionSnapshot } from "@repo/api/schemas";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import {
	applySessionSnapshot,
	clearAuthSession,
} from "@/shared/lib/auth/auth-session";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

export const SESSION_REFRESH_LEAD_MS = 60_000;
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

let refreshPromise: Promise<unknown> | null = null;

export const resetRefreshMutex = (): void => {
	refreshPromise = null;
};

export const withRefreshMutex = async <T>(
	refresh: () => Promise<T>,
): Promise<T> => {
	if (!refreshPromise) {
		refreshPromise = refresh().finally(() => {
			refreshPromise = null;
		});
	}

	return refreshPromise as Promise<T>;
};

export const getSessionRefreshDelayMs = (
	sessionExpiresAt: string,
	now = Date.now(),
): number => {
	const expiresAt = Date.parse(sessionExpiresAt);
	if (Number.isNaN(expiresAt)) {
		return 0;
	}

	return Math.min(
		MAX_TIMEOUT_MS,
		Math.max(0, expiresAt - now - SESSION_REFRESH_LEAD_MS),
	);
};

export const bootstrapSession = async (): Promise<SessionSnapshot | null> => {
	try {
		const response = await orpcClient.user.me();
		return response.data;
	} catch {
		return null;
	}
};

export const refreshSession = async (): Promise<SessionSnapshot | null> => {
	return withRefreshMutex(async () => {
		try {
			const response = await orpcClient.user.refresh();
			applySessionSnapshot(response.data);
			return response.data;
		} catch {
			clearAuthSession();
			return null;
		}
	});
};

export const logoutSession = async (): Promise<void> => {
	try {
		await controlledAsync(() => orpcClient.user.logout());
	} finally {
		clearAuthSession();
	}
};
