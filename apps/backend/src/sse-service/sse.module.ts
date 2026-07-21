import { Module } from "@nestjs/common";
import { AuthModule } from "../auth-service/auth.module.js";
import { SseController } from "./sse.controller.js";
import { SseService } from "./sse.service.js";
import { SseConnectionRegistry } from "./sse-connection-registry.service.js";
import { SsePublisher } from "./sse-publisher.service.js";
import { SseSubscriber } from "./sse-subscriber.service.js";

@Module({
	imports: [AuthModule],
	controllers: [SseController],
	providers: [SseConnectionRegistry, SseService, SsePublisher, SseSubscriber],
	exports: [SseConnectionRegistry, SseService, SsePublisher],
})
export class SseModule {}
