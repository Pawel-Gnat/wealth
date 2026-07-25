import { Module } from "@nestjs/common";
import { SseConnectionRegistry } from "./sse-connection-registry.service.js";
import { SsePublisher } from "./sse-publisher.service.js";
import { SseSubscriber } from "./sse-subscriber.service.js";

@Module({
	providers: [SseConnectionRegistry, SsePublisher, SseSubscriber],
	exports: [SseConnectionRegistry, SsePublisher],
})
export class SseRealtimeModule {}
