import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	refreshAccessToken,
	resetRefreshMutex,
} from "@/shared/lib/auth/refresh-access-token";

const { refreshAccessTokenRawMock } = vi.hoisted(() => ({
	refreshAccessTokenRawMock: vi.fn<() => Promise<string | null>>(),
}));

vi.mock("@/shared/lib/auth/refresh-access-token-raw", () => ({
	refreshAccessTokenRaw: refreshAccessTokenRawMock,
}));

vi.mock("@/shared/helpers/delay", () => ({
	delay: () => Promise.resolve(),
}));

vi.mock("@/shared/lib/auth/auth-tab-sync", () => ({
	publishAuthTabSyncMessage: vi.fn(),
	subscribeAuthTabSync: vi.fn(() => () => undefined),
}));

const createExclusiveLockStub = () => {
	let chain: Promise<unknown> = Promise.resolve();

	return {
		request: vi.fn(
			<_T>(_name: string, callback: () => Promise<string | null>) => {
				const run = chain.then(() => callback());
				chain = run.then(
					() => undefined,
					() => undefined,
				);
				return run;
			},
		),
	};
};

describe("refreshAccessToken", () => {
	const parallelCallers = 5;

	beforeEach(() => {
		Object.defineProperty(navigator, "locks", {
			configurable: true,
			value: createExclusiveLockStub(),
			writable: true,
		});
		refreshAccessTokenRawMock.mockReset();
	});

	afterEach(() => {
		resetRefreshMutex();
	});

	it("shares one raw refresh across parallel callers when locks exist", async () => {
		refreshAccessTokenRawMock.mockResolvedValue("token-1");

		const results = await Promise.all(
			Array.from({ length: parallelCallers }, () => refreshAccessToken()),
		);

		expect(results).toEqual(
			Array.from({ length: parallelCallers }, () => "token-1"),
		);
		expect(refreshAccessTokenRawMock).toHaveBeenCalledTimes(1);
	});

	it("retries at most twice for a dead session across parallel callers", async () => {
		refreshAccessTokenRawMock.mockResolvedValue(null);

		const results = await Promise.all(
			Array.from({ length: parallelCallers }, () => refreshAccessToken()),
		);

		expect(results).toEqual(
			Array.from({ length: parallelCallers }, () => null),
		);
		expect(refreshAccessTokenRawMock.mock.calls.length).toBeLessThanOrEqual(2);
	});
});
