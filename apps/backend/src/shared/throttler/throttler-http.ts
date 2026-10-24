import { Controller, Get, type INestApplication, Module } from "@nestjs/common";
import { APP_FILTER, NestFactory } from "@nestjs/core";
import { SkipThrottle } from "@nestjs/throttler";
import { ObservabilityExceptionFilter } from "../../filters/observability-exception.filter";
import { AuthThrottle } from "./auth-throttle";
import { AppThrottlerModule } from "./throttler.module";

export const THROTTLE_HTTP_PATHS = {
	plain: "/plain",
	auth: "/auth",
	skipped: "/skipped",
} as const;

@Controller()
class ThrottlerHttpController {
	@Get(THROTTLE_HTTP_PATHS.plain)
	plain() {
		return { ok: true };
	}

	@AuthThrottle()
	@Get(THROTTLE_HTTP_PATHS.auth)
	auth() {
		return { ok: true };
	}

	@SkipThrottle()
	@Get(THROTTLE_HTTP_PATHS.skipped)
	skipped() {
		return { ok: true };
	}
}

@Module({
	imports: [AppThrottlerModule],
	controllers: [ThrottlerHttpController],
	providers: [
		{
			provide: APP_FILTER,
			useClass: ObservabilityExceptionFilter,
		},
	],
})
class ThrottlerHttpModule {}

export const listenThrottlerHttpApp = async () => {
	const app = await NestFactory.create(ThrottlerHttpModule, { logger: false });
	await app.listen(0, "127.0.0.1");
	const address = app.getHttpServer().address();

	if (address === null || typeof address === "string") {
		throw new Error("Throttler test server did not bind to a port");
	}

	return {
		app,
		origin: `http://127.0.0.1:${address.port}`,
	};
};

export const getThrottlerRoute = (origin: string, path: string) =>
	fetch(`${origin}${path}`);

export const getThrottlerStatuses = async (
	origin: string,
	path: string,
	count: number,
) => {
	const statuses: number[] = [];

	for (let index = 0; index < count; index++) {
		const response = await getThrottlerRoute(origin, path);
		statuses.push(response.status);
	}

	return statuses;
};

export const closeThrottlerHttpApp = (app: INestApplication) => app.close();
