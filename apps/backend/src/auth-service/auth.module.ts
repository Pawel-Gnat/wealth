import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ACCESS_TOKEN_EXPIRES_IN } from "@repo/common/constants";
import { SseModule } from "../sse-service/sse.module.js";
import { UsersModule } from "../users-service/users.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";

@Module({
	imports: [
		UsersModule,
		forwardRef(() => SseModule),
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				secret: config.getOrThrow<string>("JWT_SECRET"),
				signOptions: { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
			}),
			inject: [ConfigService],
		}),
		PassportModule,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
