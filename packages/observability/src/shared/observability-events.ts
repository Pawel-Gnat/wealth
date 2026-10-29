export const OBSERVABILITY_EVENTS = {
	sseFrame: "sse.frame.error",
	sseEnvelope: "sse.envelope.error",
	sessionEndedPublish: "auth.session-ended.publish.error",
	avatarPreviousDelete: "auth.avatar.previous-delete.error",
} as const;

export type ObservabilityEvent =
	(typeof OBSERVABILITY_EVENTS)[keyof typeof OBSERVABILITY_EVENTS];
