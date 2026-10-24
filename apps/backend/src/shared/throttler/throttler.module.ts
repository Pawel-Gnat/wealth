import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppThrottlerGuard } from "./app-throttler.guard";
import { AUTH_THROTTLE, DEFAULT_THROTTLE } from "./constants";

@Module({
	imports: [
		ThrottlerModule.forRoot({
			throttlers: [
				{
					name: DEFAULT_THROTTLE.name,
					limit: DEFAULT_THROTTLE.limit,
					ttl: DEFAULT_THROTTLE.ttl,
				},
				{
					name: AUTH_THROTTLE.name,
					limit: AUTH_THROTTLE.limit,
					ttl: AUTH_THROTTLE.ttl,
				},
			],
		}),
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AppThrottlerGuard,
		},
	],
})
export class AppThrottlerModule {}
