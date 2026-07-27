import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, REQUEST } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ORPCModule, onError } from "@orpc/nest";
import * as Sentry from "@sentry/nestjs";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import type { Request, Response } from "express";
import { AuthModule } from "./auth-service/auth.module.js";
import { BotsModule } from "./bots-service/bots.module.js";
import { DashboardModule } from "./dashboard-service/dashboard.module.js";
import { DatabaseModule } from "./database-service/database.module.js";
import { ExpensesModule } from "./expenses-service/expenses.module.js";
import { HealthModule } from "./health-service/health.module.js";
import { IncomesModule } from "./incomes-service/incomes.module.js";
import { RedisModule } from "./redis-service/redis.module.js";
import { SseHttpModule } from "./sse-service/sse-http.module.js";
import { SseRealtimeModule } from "./sse-service/sse-realtime.module.js";
import { UsersModule } from "./users-service/users.module.js";

declare module "@orpc/nest" {
	interface ORPCGlobalContext {
		request: Request;
		response: Response;
	}
}

@Module({
	imports: [
		SentryModule.forRoot(),
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		ScheduleModule.forRoot(),
		ORPCModule.forRootAsync({
			useFactory: (request: Request) => {
				if (!request.res) {
					throw new Error("Response is not available on request");
				}

				return {
					context: { request, response: request.res },
					interceptors: [
						onError((error: unknown) => {
							console.error("[oRPC]", error);
							Sentry.captureException(error);
						}),
					],
				};
			},
			inject: [REQUEST],
		}),
		UsersModule,
		ExpensesModule,
		IncomesModule,
		DashboardModule,
		AuthModule,
		BotsModule,
		DatabaseModule,
		RedisModule,
		HealthModule,
		SseRealtimeModule,
		SseHttpModule,
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: SentryGlobalFilter,
		},
	],
})
export class AppModule {
	private readonly logger = new Logger(AppModule.name);

	constructor(private readonly configService: ConfigService) {}

	onModuleInit() {
		const botPassword = this.configService.get<string>("BOT_PASSWORD")?.trim();

		if (!botPassword) {
			this.logger.log("Daily activity bots disabled: BOT_PASSWORD is missing");
			return;
		}

		this.logger.log("Daily activity bots enabled");
	}
}
