import { ForbiddenException } from "@nestjs/common";
import {
	AUTH_CSRF_HEADER_NAME,
	AUTH_CSRF_HEADER_VALUE,
} from "@repo/common/constants";
import { describe, expect, it } from "vitest";
import { AuthCookieCsrfGuard } from "./auth-cookie-csrf.guard.js";

const createContext = (
	headers: Record<string, string | string[] | undefined>,
) =>
	({
		switchToHttp: () => ({
			getRequest: () => ({ headers }),
		}),
	}) as never;

describe("AuthCookieCsrfGuard", () => {
	const guard = new AuthCookieCsrfGuard();

	it("allows requests with the expected CSRF header", () => {
		expect(
			guard.canActivate(
				createContext({ [AUTH_CSRF_HEADER_NAME]: AUTH_CSRF_HEADER_VALUE }),
			),
		).toBe(true);
	});

	it("rejects requests without the CSRF header", () => {
		expect(() => guard.canActivate(createContext({}))).toThrow(
			ForbiddenException,
		);
	});

	it("rejects requests with the wrong CSRF header value", () => {
		expect(() =>
			guard.canActivate(createContext({ [AUTH_CSRF_HEADER_NAME]: "nope" })),
		).toThrow(ForbiddenException);
	});
});
