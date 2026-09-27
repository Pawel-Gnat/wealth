import { Module } from "@nestjs/common";
import { SessionGuard } from "../guards/session.guard";
import { SseRealtimeModule } from "../sse-service/sse-realtime.module";
import { UsersModule } from "../users-service/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
	imports: [UsersModule, SseRealtimeModule],
	controllers: [AuthController],
	providers: [AuthService, SessionGuard],
	exports: [AuthService, SessionGuard],
})
export class AuthModule {}
