import { Module } from "@nestjs/common";
import { SseConnectionRegistry } from "./sse-connection-registry.service";
import { SsePublisher } from "./sse-publisher.service";
import { SseSubscriber } from "./sse-subscriber.service";

@Module({
	providers: [SseConnectionRegistry, SsePublisher, SseSubscriber],
	exports: [SseConnectionRegistry, SsePublisher],
})
export class SseRealtimeModule {}
