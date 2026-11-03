export type {
	EventSourceFactory,
	EventSourceLike,
	NotificationSseEvent,
} from "@/shared/lib/sse/sse-gateway";
export {
	configureSseGateway,
	dispatchSseMessage,
	resetSseGatewayForTests,
	startSseGateway,
	stopSseGateway,
	subscribeSseConnectionDrop,
	subscribeSseConnectionOpen,
	subscribeSseNotifications,
} from "@/shared/lib/sse/sse-gateway";
