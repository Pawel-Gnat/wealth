import { Module } from "@nestjs/common";
import { SseConnectionRegistry } from "./sse-connection-registry.service";
import { SsePublisher } from "./sse-publisher.service";

@Module({
	providers: [SseConnectionRegistry, SsePublisher],
	exports: [SseConnectionRegistry, SsePublisher],
})
export class SseRealtimeModule {}
