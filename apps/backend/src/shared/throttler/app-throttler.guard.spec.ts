import { Reflector } from "@nestjs/core";
import { describe, expect, it } from "vitest";
import { lacksAuthThrottle } from "./app-throttler.guard";
import { AUTH_THROTTLE_ENABLED } from "./constants";

const createContext = (handler: object, classRef: object) =>
	({
		getHandler: () => handler,
		getClass: () => classRef,
	}) as never;

describe("lacksAuthThrottle", () => {
	const reflector = new Reflector();

	it("skips the auth bucket when the handler is not marked", () => {
		expect(
			lacksAuthThrottle(
				reflector,
				createContext(function plain() {}, class Probe {}),
			),
		).toBe(true);
	});

	it("keeps the auth bucket when the handler is marked", () => {
		const handler = function auth() {};
		Reflect.defineMetadata(AUTH_THROTTLE_ENABLED, true, handler);

		expect(
			lacksAuthThrottle(reflector, createContext(handler, class Probe {})),
		).toBe(false);
	});
});
