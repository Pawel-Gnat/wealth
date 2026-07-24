import { createBroadcastBus } from "@/shared/helpers/broadcast-bus";

const CHANNEL_NAME = "wealth.auth";

export const AUTH_BUS_MESSAGE_TYPES = [
	"refresh-done",
	"session-ready",
] as const;

export type AuthBusMessageType = (typeof AUTH_BUS_MESSAGE_TYPES)[number];

export type AuthBusMessage = {
	type: AuthBusMessageType;
};

const isAuthBusMessageType = (value: unknown): value is AuthBusMessageType => {
	return AUTH_BUS_MESSAGE_TYPES.some((type) => type === value);
};

export const isAuthBusMessage = (data: unknown): data is AuthBusMessage => {
	if (typeof data !== "object" || data === null || !("type" in data)) {
		return false;
	}

	return isAuthBusMessageType(data.type);
};

const authBus = createBroadcastBus(CHANNEL_NAME, isAuthBusMessage);

export const publishAuthTabSyncMessage = (message: AuthBusMessage): void => {
	authBus.publish(message);
};

export const subscribeAuthTabSync = (
	listener: (message: AuthBusMessage) => void,
): (() => void) => {
	return authBus.subscribe(listener);
};

export const notifySessionReadyAcrossTabs = (): void => {
	authBus.publish({ type: "session-ready" });
};
