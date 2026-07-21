import { Module } from "@nestjs/common";
import { AuthModule } from "../auth-service/auth.module.js";
import { SseController } from "./sse.controller.js";
import { SseService } from "./sse.service.js";
import { SseConnectionRegistry } from "./sse-connection-registry.service.js";

@Module({
	imports: [AuthModule],
	controllers: [SseController],
	providers: [SseConnectionRegistry, SseService],
	exports: [SseConnectionRegistry, SseService],
})
export class SseModule {}
