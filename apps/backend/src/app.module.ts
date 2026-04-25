import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { ORPCModule, onError } from "@orpc/nest";
import type { Request } from "express";
import { AuthModule } from "./auth/auth.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { UsersModule } from "./users/users.module.js";

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
})
export class AppModule {}
