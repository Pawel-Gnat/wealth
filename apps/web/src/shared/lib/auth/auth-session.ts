import type { SessionSnapshot } from "@repo/api/schemas";

type AuthSessionHandlers = {
	onSessionApplied?: (snapshot: SessionSnapshot) => void;
	onUnauthorized?: () => void;
};

let sessionActive = false;
let onSessionApplied: ((snapshot: SessionSnapshot) => void) | undefined;
let onUnauthorized: (() => void) | undefined;

export const configureAuthSession = (next: AuthSessionHandlers): void => {
	onSessionApplied = next.onSessionApplied;
	onUnauthorized = next.onUnauthorized;
};

export const applySessionSnapshot = (snapshot: SessionSnapshot): void => {
	sessionActive = true;
	onSessionApplied?.(snapshot);
};

export const clearAuthSession = (): void => {
	if (!sessionActive) {
		return;
	}

	sessionActive = false;
	onUnauthorized?.();
};
