import { Module } from "@nestjs/common";
import { SseConnectionRegistry } from "./sse-connection-registry.service.js";

@Module({
	providers: [SseConnectionRegistry],
	exports: [SseConnectionRegistry],
})
export class SseModule {}
