import { type AUTH_EVENTS, RECORD_EVENTS } from "@repo/api/events";
import { logger } from "@repo/observability/node";
import type { ObservabilityEvent } from "@repo/observability/shared";

type AuthEvent = (typeof AUTH_EVENTS)[keyof typeof AUTH_EVENTS];
type RecordEventKind = keyof typeof RECORD_EVENTS;
type RecordEventMutation = keyof (typeof RECORD_EVENTS)["expense"];

export const logAuthEvent = (
	event: AuthEvent | ObservabilityEvent,
	level: "info" | "warn" = "info",
) => {
	logger[level](event);
};

export const logDocumentSucceeded = (
	kind: RecordEventKind,
	mutation: RecordEventMutation,
) => {
	logger.info(RECORD_EVENTS[kind][mutation]);
};

export const logSseEvent = (
	event: ObservabilityEvent,
	level: "info" | "warn" = "warn",
) => {
	logger[level](event);
};
