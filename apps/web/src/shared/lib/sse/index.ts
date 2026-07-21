export { dispatchSseMessage } from "@/shared/lib/sse/sse-dispatcher";
export type {
	EventSourceFactory,
	EventSourceLike,
} from "@/shared/lib/sse/sse-gateway";
export {
	configureSseGateway,
	resetSseGatewayForTests,
	startSseGateway,
	stopSseGateway,
} from "@/shared/lib/sse/sse-gateway";
