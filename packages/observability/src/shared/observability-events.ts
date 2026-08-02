export const AUTH_OBSERVABILITY_EVENTS = {
	signInSucceeded: "auth.sign-in.succeeded",
	signUpSucceeded: "auth.sign-up.succeeded",
	logoutSucceeded: "auth.logout.succeeded",
	refreshSucceeded: "auth.refresh.succeeded",
	refreshWebLocksUnavailable: "auth.refresh.web-locks-unavailable",
	sessionRevokedPublishFailed: "auth.session-revoked.publish-failed",
} as const;

export type AuthObservabilityEvent =
	(typeof AUTH_OBSERVABILITY_EVENTS)[keyof typeof AUTH_OBSERVABILITY_EVENTS];

export const DOCUMENT_OBSERVABILITY_EVENTS = {
	expense: {
		create: "expense.create.succeeded",
		update: "expense.update.succeeded",
		delete: "expense.delete.succeeded",
	},
	income: {
		create: "income.create.succeeded",
		update: "income.update.succeeded",
		delete: "income.delete.succeeded",
	},
} as const;

export type DocumentRecordKind = keyof typeof DOCUMENT_OBSERVABILITY_EVENTS;

export type DocumentMutationEvent =
	keyof (typeof DOCUMENT_OBSERVABILITY_EVENTS)[DocumentRecordKind];

export const SSE_OBSERVABILITY_EVENTS = {
	frameMalformed: "sse.frame.malformed",
	envelopeInvalid: "sse.envelope.invalid",
} as const;

export type SseObservabilityEvent =
	(typeof SSE_OBSERVABILITY_EVENTS)[keyof typeof SSE_OBSERVABILITY_EVENTS];

export const getDocumentObservabilityEvents = (kind: DocumentRecordKind) =>
	DOCUMENT_OBSERVABILITY_EVENTS[kind];
