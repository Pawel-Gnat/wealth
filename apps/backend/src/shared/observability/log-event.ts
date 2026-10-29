import type { AUTH_EVENTS } from "@repo/api/events";
import { logger } from "@repo/observability/node";
import type {
	DomainLogContext,
	ObservabilityEvent,
} from "@repo/observability/shared";

type AuthEvent = (typeof AUTH_EVENTS)[keyof typeof AUTH_EVENTS];

export const logAuthEvent = (
	event: AuthEvent | ObservabilityEvent,
	level: "info" | "warn" = "info",
) => {
	logger[level](event);
};

export const logSseEvent = (
	event: ObservabilityEvent,
	level: "info" | "warn" = "warn",
) => {
	logger[level](event);
};

export const logDomainEvent = (event: string, domain: DomainLogContext) => {
	logger.info(event, domain);
};
