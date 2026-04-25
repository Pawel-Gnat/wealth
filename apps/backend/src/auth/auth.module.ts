import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";

@Module({
	imports: [
		UsersModule,
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				secret: config.getOrThrow<string>("JWT_SECRET"),
				signOptions: { expiresIn: "1d" },
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
