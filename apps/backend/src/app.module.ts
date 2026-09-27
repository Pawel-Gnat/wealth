import {
	type MiddlewareConsumer,
	Module,
	type NestModule,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, REQUEST } from "@nestjs/core";
import { ORPCModule, onError } from "@orpc/nest";
import { captureException } from "@repo/observability/node";
import type { Request, Response } from "express";
import { AuthModule } from "./auth-service/auth.module";
import { BudgetModule } from "./budget-service/budget.module";
import { DashboardModule } from "./dashboard-service/dashboard.module";
import { DatabaseModule } from "./database-service/database.module";
import { ExpensesModule } from "./expenses-service/expenses.module";
import {
	ObservabilityExceptionFilter,
	shouldCaptureException,
} from "./filters/observability-exception.filter";
import { HealthModule } from "./health-service/health.module";
import { IncomesModule } from "./incomes-service/incomes.module";
import { RequestIdMiddleware } from "./middleware/request-id.middleware";
import { RedisModule } from "./redis-service/redis.module";
import { SseHttpModule } from "./sse-service/sse-http.module";
import { SseRealtimeModule } from "./sse-service/sse-realtime.module";
import { StorageModule } from "./storage-service/storage.module";
import { UsersModule } from "./users-service/users.module";

declare module "@orpc/nest" {
	interface ORPCGlobalContext {
		request: Request;
		response: Response;
	}
}

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
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
							if (shouldCaptureException(error)) {
								captureException(error);
							}
						}),
					],
				};
			},
			inject: [REQUEST],
		}),
		UsersModule,
		StorageModule,
		ExpensesModule,
		BudgetModule,
		IncomesModule,
		DashboardModule,
		AuthModule,
		DatabaseModule,
		RedisModule,
		HealthModule,
		SseRealtimeModule,
		SseHttpModule,
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: ObservabilityExceptionFilter,
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequestIdMiddleware).forRoutes("*");
	}
}
