import { Module } from "@nestjs/common";
import { AuthModule } from "../auth-service/auth.module.js";
import { SseController } from "./sse.controller.js";
import { SseService } from "./sse.service.js";
import { SseRealtimeModule } from "./sse-realtime.module.js";

@Module({
	imports: [AuthModule, SseRealtimeModule],
	controllers: [SseController],
	providers: [SseService],
})
export class SseHttpModule {}
