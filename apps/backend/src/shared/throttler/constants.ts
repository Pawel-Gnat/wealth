const THROTTLE_WINDOW_MS = 60_000;

export const AUTH_THROTTLE_ENABLED = "authThrottleEnabled";

export const DEFAULT_THROTTLE = {
	name: "default",
	limit: 60,
	ttl: THROTTLE_WINDOW_MS,
} as const;

export const AUTH_THROTTLE = {
	name: "auth",
	limit: 5,
	ttl: THROTTLE_WINDOW_MS,
} as const;
