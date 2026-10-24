import { ORPCError } from "@orpc/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	configureWebHttp,
	controlledAsync,
} from "@/shared/helpers/controlled-fetch";

describe("controlledAsync", () => {
	const onClientError = vi.fn();

	beforeEach(() => {
		onClientError.mockClear();
		configureWebHttp(onClientError);
	});

	it("rethrows a 429 without reporting it", async () => {
		const rateLimit = new ORPCError("TOO_MANY_REQUESTS");

		await expect(controlledAsync(() => Promise.reject(rateLimit))).rejects.toBe(
			rateLimit,
		);
		expect(onClientError).not.toHaveBeenCalled();
	});

	it("reports other errors and wraps them", async () => {
		const failure = new Error("nope");

		await expect(
			controlledAsync(() => Promise.reject(failure)),
		).rejects.toThrow("Failed to fetch: nope");
		expect(onClientError).toHaveBeenCalledWith(failure);
	});
});
