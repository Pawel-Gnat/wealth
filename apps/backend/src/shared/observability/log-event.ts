import {
	type AuthObservabilityEvent,
	DOCUMENT_OBSERVABILITY_EVENTS,
	type DocumentMutationEvent,
	type DocumentRecordKind,
	logger,
	type SseObservabilityEvent,
} from "@repo/observability/node";

export const logAuthEvent = (
	event: AuthObservabilityEvent,
	level: "info" | "warn" = "info",
) => {
	logger[level](event);
};

export const logDocumentSucceeded = (
	kind: DocumentRecordKind,
	mutation: DocumentMutationEvent,
) => {
	logger.info(DOCUMENT_OBSERVABILITY_EVENTS[kind][mutation]);
};

export const logSseEvent = (
	event: SseObservabilityEvent,
	level: "info" | "warn" = "warn",
) => {
	logger[level](event);
};
