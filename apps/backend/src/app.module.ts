import { Module } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { ORPCModule, onError } from "@orpc/nest";
import type { Request } from "express";
import { AuthController } from "./auth/auth.controller.js";
import { AuthModule } from "./auth/auth.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { UsersModule } from "./users/users.module.js";
import { ConfigModule } from "@nestjs/config";

declare module "@orpc/nest" {
	interface ORPCGlobalContext {
		request: Request;
	}
}

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		ORPCModule.forRootAsync({
			useFactory: (request: Request) => ({
				context: { request },
				interceptors: [
					onError((error: unknown) => {
						console.error("[oRPC]", error);
					}),
				],
			}),
			inject: [REQUEST],
		}),
		UsersModule,
		AuthModule,
		DatabaseModule,
	],
	controllers: [AuthController],
})
export class AppModule {}
