import { ConfigService } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RedisService } from "./redis.service.js";

const {
	mockPublisher,
	mockSubscriber,
	RedisMock,
	publisherConnect,
	subscriberConnect,
	publisherPublish,
	publisherPing,
	publisherGet,
	publisherSet,
	publisherDel,
	publisherQuit,
	subscriberQuit,
	subscriberSubscribe,
	subscriberUnsubscribe,
	subscriberOn,
	subscriberOff,
} = vi.hoisted(() => {
	const publisherConnect = vi.fn();
	const subscriberConnect = vi.fn();
	const publisherPublish = vi.fn();
	const publisherPing = vi.fn();
	const publisherGet = vi.fn();
	const publisherSet = vi.fn();
	const publisherDel = vi.fn();
	const publisherQuit = vi.fn();
	const subscriberQuit = vi.fn();
	const subscriberSubscribe = vi.fn();
	const subscriberUnsubscribe = vi.fn();
	const subscriberOn = vi.fn();
	const subscriberOff = vi.fn();

	const mockPublisher = {
		connect: publisherConnect,
		publish: publisherPublish,
		ping: publisherPing,
		get: publisherGet,
		set: publisherSet,
		del: publisherDel,
		quit: publisherQuit,
		on: vi.fn(),
	};

	const mockSubscriber = {
		connect: subscriberConnect,
		subscribe: subscriberSubscribe,
		unsubscribe: subscriberUnsubscribe,
		quit: subscriberQuit,
		on: subscriberOn,
		off: subscriberOff,
	};

	const RedisMock = vi.fn();

	return {
		mockPublisher,
		mockSubscriber,
		RedisMock,
		publisherConnect,
		subscriberConnect,
		publisherPublish,
		publisherPing,
		publisherGet,
		publisherSet,
		publisherDel,
		publisherQuit,
		subscriberQuit,
		subscriberSubscribe,
		subscriberUnsubscribe,
		subscriberOn,
		subscriberOff,
	};
});

vi.mock("ioredis", () => ({
	Redis: RedisMock,
}));

const mockRedisPair = () => {
	RedisMock.mockImplementationOnce(() => mockPublisher).mockImplementationOnce(
		() => mockSubscriber,
	);
};

describe("RedisService", () => {
	let moduleRef: TestingModule;
	let redisService: RedisService;
	let configGet: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		vi.clearAllMocks();
		RedisMock.mockReset();
		mockRedisPair();
		publisherConnect.mockResolvedValue(undefined);
		subscriberConnect.mockResolvedValue(undefined);
		publisherPublish.mockResolvedValue(1);
		publisherPing.mockResolvedValue("PONG");
		publisherGet.mockResolvedValue(null);
		publisherSet.mockResolvedValue("OK");
		publisherDel.mockResolvedValue(1);
		publisherQuit.mockResolvedValue("OK");
		subscriberQuit.mockResolvedValue("OK");
		subscriberSubscribe.mockResolvedValue(undefined);
		subscriberUnsubscribe.mockResolvedValue("OK");

		configGet = vi.fn();
		moduleRef = await Test.createTestingModule({
			providers: [
				RedisService,
				{
					provide: ConfigService,
					useValue: { get: configGet },
				},
			],
		}).compile();
		redisService = moduleRef.get(RedisService);
	});

	afterEach(async () => {
		await moduleRef.close();
		vi.useRealTimers();
	});

	it("stays unavailable when REDIS_URL is missing", async () => {
		configGet.mockReturnValue(undefined);

		await redisService.onModuleInit();

		expect(RedisMock).not.toHaveBeenCalled();
		expect(redisService.isAvailable()).toBe(false);
		await expect(redisService.publish("sse:user:1", "{}")).resolves.toBe(false);
		await expect(redisService.ping()).resolves.toBe(false);
	});

	it("connects publisher and subscriber when REDIS_URL is set", async () => {
		configGet.mockReturnValue("redis://localhost:6379");

		await redisService.onModuleInit();

		expect(RedisMock).toHaveBeenCalledTimes(2);
		expect(publisherConnect).toHaveBeenCalledOnce();
		expect(subscriberConnect).toHaveBeenCalledOnce();
		expect(redisService.isAvailable()).toBe(true);
		expect(redisService.getPublisher()).toBe(mockPublisher);
		expect(redisService.getSubscriber()).toBe(mockSubscriber);
		await expect(redisService.ping()).resolves.toBe(true);
		expect(publisherPing).toHaveBeenCalledOnce();
	});

	it("degrades when Redis connect fails and recovers on later ensureConnected", async () => {
		configGet.mockReturnValue("redis://localhost:6379");
		publisherConnect.mockRejectedValueOnce(new Error("ECONNREFUSED"));

		await redisService.onModuleInit();

		expect(redisService.isAvailable()).toBe(false);
		expect(publisherQuit).toHaveBeenCalledOnce();
		expect(subscriberQuit).toHaveBeenCalledOnce();

		mockRedisPair();
		publisherConnect.mockRejectedValueOnce(new Error("still down"));
		await expect(redisService.publish("sse:user:1", "{}")).resolves.toBe(false);

		mockRedisPair();
		publisherConnect.mockResolvedValue(undefined);
		subscriberConnect.mockResolvedValue(undefined);

		await expect(redisService.publish("sse:user:1", "{}")).resolves.toBe(true);
		expect(redisService.isAvailable()).toBe(true);
		expect(publisherPublish).toHaveBeenCalledWith("sse:user:1", "{}");
	});

	it("stores message listeners before connect and attaches them after recovery", async () => {
		configGet.mockReturnValue("redis://localhost:6379");
		publisherConnect.mockRejectedValueOnce(new Error("ECONNREFUSED"));
		await redisService.onModuleInit();

		const listener = vi.fn();
		const unsubscribe = redisService.onMessage(listener);
		expect(subscriberOn).not.toHaveBeenCalledWith("message", listener);

		mockRedisPair();
		publisherConnect.mockResolvedValue(undefined);
		subscriberConnect.mockResolvedValue(undefined);

		await expect(redisService.ensureConnected()).resolves.toBe(true);
		expect(subscriberOn).toHaveBeenCalledWith("message", listener);

		unsubscribe();
		expect(subscriberOff).toHaveBeenCalledWith("message", listener);
	});

	it("publishes when available and returns false on publish errors", async () => {
		configGet.mockReturnValue("redis://localhost:6379");
		await redisService.onModuleInit();

		await expect(
			redisService.publish("sse:user:1", '{"type":"ping"}'),
		).resolves.toBe(true);
		expect(publisherPublish).toHaveBeenCalledWith(
			"sse:user:1",
			'{"type":"ping"}',
		);

		publisherPublish.mockRejectedValueOnce(new Error("disconnected"));
		await expect(redisService.publish("sse:user:1", "{}")).resolves.toBe(false);
	});

	it("supports get, set, setNxEx and del through publisher", async () => {
		configGet.mockReturnValue("redis://localhost:6379");
		await redisService.onModuleInit();

		publisherGet.mockResolvedValueOnce("value-1");
		await expect(redisService.get("bots:daily:2026-07-27")).resolves.toBe(
			"value-1",
		);
		expect(publisherGet).toHaveBeenCalledWith("bots:daily:2026-07-27");

		await expect(redisService.set("bots:daily:2026-07-27", "{}")).resolves.toBe(
			undefined,
		);
		expect(publisherSet).toHaveBeenCalledWith("bots:daily:2026-07-27", "{}");

		await expect(
			redisService.set("bots:daily:2026-07-27", "{}", { ex: 120 }),
		).resolves.toBe(undefined);
		expect(publisherSet).toHaveBeenCalledWith(
			"bots:daily:2026-07-27",
			"{}",
			"EX",
			120,
		);

		publisherSet.mockResolvedValueOnce("OK");
		await expect(
			redisService.setNxEx("bots:claim:2026-07-27:bot1", "1", 300),
		).resolves.toBe(true);
		expect(publisherSet).toHaveBeenCalledWith(
			"bots:claim:2026-07-27:bot1",
			"1",
			"EX",
			300,
			"NX",
		);

		publisherSet.mockResolvedValueOnce(null);
		await expect(
			redisService.setNxEx("bots:claim:2026-07-27:bot2", "1", 300),
		).resolves.toBe(false);

		await expect(redisService.del("bots:claim:2026-07-27:bot1")).resolves.toBe(
			undefined,
		);
		expect(publisherDel).toHaveBeenCalledWith("bots:claim:2026-07-27:bot1");
	});

	it("throws on kv calls when Redis is unavailable", async () => {
		configGet.mockReturnValue(undefined);
		await redisService.onModuleInit();

		await expect(redisService.get("bots:daily:2026-07-27")).rejects.toThrow(
			"Redis is unavailable",
		);
		await expect(
			redisService.set("bots:daily:2026-07-27", "{}", { ex: 120 }),
		).rejects.toThrow("Redis is unavailable");
		await expect(
			redisService.setNxEx("bots:claim:2026-07-27:bot1", "1", 300),
		).rejects.toThrow("Redis is unavailable");
		await expect(
			redisService.del("bots:claim:2026-07-27:bot1"),
		).rejects.toThrow("Redis is unavailable");
	});

	it("subscribes and unsubscribes when available", async () => {
		configGet.mockReturnValue("redis://localhost:6379");
		await redisService.onModuleInit();

		await expect(redisService.subscribe("sse:user:1")).resolves.toBe(true);
		expect(subscriberSubscribe).toHaveBeenCalledWith("sse:user:1");

		await expect(redisService.unsubscribe("sse:user:1")).resolves.toBe(true);
		expect(subscriberUnsubscribe).toHaveBeenCalledWith("sse:user:1");

		subscriberSubscribe.mockRejectedValueOnce(new Error("disconnected"));
		await expect(redisService.subscribe("sse:user:1")).resolves.toBe(false);
	});

	it("quits clients on destroy", async () => {
		configGet.mockReturnValue("redis://localhost:6379");
		await redisService.onModuleInit();

		await redisService.onModuleDestroy();

		expect(publisherQuit).toHaveBeenCalledOnce();
		expect(subscriberQuit).toHaveBeenCalledOnce();
		expect(redisService.isAvailable()).toBe(false);
	});
});
