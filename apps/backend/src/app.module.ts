import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, REQUEST } from "@nestjs/core";
import { ORPCModule, onError } from "@orpc/nest";
import * as Sentry from "@sentry/nestjs";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import type { Request } from "express";
import { AuthModule } from "./auth/auth.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { ExpensesModule } from "./expenses/expenses.module.js";
import { UsersModule } from "./users/users.module.js";

declare module "@orpc/nest" {
	interface ORPCGlobalContext {
		request: Request;
	}
}

@Module({
	imports: [
		SentryModule.forRoot(),
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		ORPCModule.forRootAsync({
			useFactory: (request: Request) => ({
				context: { request },
				interceptors: [
					onError((error: unknown) => {
						console.error("[oRPC]", error);
						Sentry.captureException(error);
					}),
				],
			}),
			inject: [REQUEST],
		}),
		UsersModule,
		ExpensesModule,
		AuthModule,
		DatabaseModule,
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: SentryGlobalFilter,
		},
	],
})
export class AppModule {}
