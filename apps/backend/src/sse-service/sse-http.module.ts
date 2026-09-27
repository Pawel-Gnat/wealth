import { Module } from "@nestjs/common";
import { AuthModule } from "../auth-service/auth.module";
import { SseController } from "./sse.controller";
import { SseService } from "./sse.service";
import { SseRealtimeModule } from "./sse-realtime.module";

@Module({
	imports: [AuthModule, SseRealtimeModule],
	controllers: [SseController],
	providers: [SseService],
})
export class SseHttpModule {}
