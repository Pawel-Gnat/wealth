import type { SessionSnapshot } from "@repo/api/types";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type AuthHandlers = {
	onApplied?: (snapshot: SessionSnapshot) => void;
	onCleared?: () => void;
};

let refreshPromise: Promise<unknown> | null = null;
let sessionActive = false;
let onApplied: AuthHandlers["onApplied"];
let onCleared: AuthHandlers["onCleared"];

export const configureAuth = (next: AuthHandlers): void => {
	onApplied = next.onApplied;
	onCleared = next.onCleared;
};

export const applySessionSnapshot = (snapshot: SessionSnapshot): void => {
	sessionActive = true;
	onApplied?.(snapshot);
};

export const clearAuthSession = (): void => {
	if (!sessionActive) {
		return;
	}

	sessionActive = false;
	onCleared?.();
};

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

export const bootstrapSession = async (): Promise<SessionSnapshot | null> => {
	try {
		const response = await orpcClient.user.me();
		return response.data;
	} catch (error) {
		if (isUnauthorizedStatus(error)) {
			return null;
		}

		throw error;
	}
};

const isUnauthorizedStatus = (error: unknown): boolean => {
	return (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		error.status === 401
	);
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
