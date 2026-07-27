import { beforeEach, describe, expect, it, vi } from "vitest";
import { BotsDayStateService } from "./bots-day-state.service.js";

describe("BotsDayStateService", () => {
	const redisServiceMock = {
		get: vi.fn(),
		set: vi.fn(),
		setNxEx: vi.fn(),
	};
	const botIds = ["bot1", "bot2", "bot3"] as const;
	let service: BotsDayStateService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new BotsDayStateService(redisServiceMock as never);
	});

	it("builds date key with expected prefix", () => {
		expect(service.buildDayKey("2026-07-27")).toBe("bots:daily:2026-07-27");
	});

	it("creates initial state with hours 8-22 and false tried flags", async () => {
		redisServiceMock.get.mockResolvedValueOnce(null);
		redisServiceMock.setNxEx.mockResolvedValueOnce(true);
		vi.spyOn(Math, "random").mockReturnValue(0.5);

		const state = await service.getOrCreateDayState("2026-07-27", botIds);

		expect(redisServiceMock.setNxEx).toHaveBeenCalledOnce();
		expect(Object.keys(state.scheduledHours)).toEqual(botIds);
		expect(Object.keys(state.tried)).toEqual(botIds);

		for (const botId of botIds) {
			expect(state.scheduledHours[botId]).toBeGreaterThanOrEqual(8);
			expect(state.scheduledHours[botId]).toBeLessThanOrEqual(22);
			expect(state.tried[botId]).toBe(false);
		}
	});

	it("returns existing state when present", async () => {
		redisServiceMock.get.mockResolvedValueOnce(
			JSON.stringify({
				scheduledHours: { bot1: 10 },
				tried: { bot1: false },
			}),
		);

		const state = await service.getOrCreateDayState("2026-07-27", botIds);

		expect(redisServiceMock.setNxEx).not.toHaveBeenCalled();
		expect(state).toEqual({
			scheduledHours: { bot1: 10 },
			tried: { bot1: false },
		});
	});

	it("uses latest state when nx set loses race", async () => {
		redisServiceMock.get.mockResolvedValueOnce(null).mockResolvedValueOnce(
			JSON.stringify({
				scheduledHours: { bot1: 12 },
				tried: { bot1: true },
			}),
		);
		redisServiceMock.setNxEx.mockResolvedValueOnce(false);

		const state = await service.getOrCreateDayState("2026-07-27", botIds);

		expect(state).toEqual({
			scheduledHours: { bot1: 12 },
			tried: { bot1: true },
		});
		expect(redisServiceMock.set).not.toHaveBeenCalled();
	});

	it("marks a bot as tried and persists day state", async () => {
		redisServiceMock.get.mockResolvedValueOnce(
			JSON.stringify({
				scheduledHours: { bot1: 9, bot2: 14 },
				tried: { bot1: false, bot2: false },
			}),
		);
		redisServiceMock.set.mockResolvedValueOnce(undefined);

		const updated = await service.markBotAsTried("2026-07-27", "bot2");

		expect(updated.tried.bot2).toBe(true);
		expect(redisServiceMock.set).toHaveBeenCalledOnce();
	});
});
