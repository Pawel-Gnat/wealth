import { Module } from "@nestjs/common";
import { SessionGuard } from "../guards/session.guard.js";
import { SseRealtimeModule } from "../sse-service/sse-realtime.module.js";
import { UsersModule } from "../users-service/users.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

@Module({
	imports: [UsersModule, SseRealtimeModule],
	controllers: [AuthController],
	providers: [AuthService, SessionGuard],
	exports: [AuthService, SessionGuard],
})
export class AuthModule {}
