import type { INestApplication } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { tooManyRequestsBody } from "../../filters/too-many-requests";
import { AUTH_THROTTLE, DEFAULT_THROTTLE } from "./constants";
import {
	closeThrottlerHttpApp,
	getThrottlerRoute,
	getThrottlerStatuses,
	listenThrottlerHttpApp,
	THROTTLE_HTTP_PATHS,
} from "./throttler-http";

const RETRY_AFTER_SECONDS = /^[1-9]\d*$/;

const expectTooManyRequests = async (response: Response) => {
	expect(response.status).toBe(tooManyRequestsBody.status);
	expect(response.headers.get("retry-after")).toMatch(RETRY_AFTER_SECONDS);
	await expect(response.json()).resolves.toEqual(tooManyRequestsBody);
};

describe("throttler http", () => {
	let app: INestApplication;
	let origin: string;

	beforeEach(async () => {
		({ app, origin } = await listenThrottlerHttpApp());
	});

	afterEach(async () => {
		await closeThrottlerHttpApp(app);
	});

	it("returns 429 when the global limit is exceeded", async () => {
		const allowed = await getThrottlerStatuses(
			origin,
			THROTTLE_HTTP_PATHS.plain,
			DEFAULT_THROTTLE.limit,
		);

		expect(allowed.every((status) => status === 200)).toBe(true);
		await expectTooManyRequests(
			await getThrottlerRoute(origin, THROTTLE_HTTP_PATHS.plain),
		);
	});

	it("returns 429 when the auth limit is exceeded", async () => {
		const allowed = await getThrottlerStatuses(
			origin,
			THROTTLE_HTTP_PATHS.auth,
			AUTH_THROTTLE.limit,
		);

		expect(allowed.every((status) => status === 200)).toBe(true);
		await expectTooManyRequests(
			await getThrottlerRoute(origin, THROTTLE_HTTP_PATHS.auth),
		);
	});

	it("does not limit a skipped route", async () => {
		const statuses = await getThrottlerStatuses(
			origin,
			THROTTLE_HTTP_PATHS.skipped,
			DEFAULT_THROTTLE.limit + 1,
		);

		expect(statuses.every((status) => status === 200)).toBe(true);
	});
});
