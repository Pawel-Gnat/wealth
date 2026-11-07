import { ConfigService } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RedisService } from "./redis.service";

const { mockClient, RedisMock, connect, ping, quit, disconnect } = vi.hoisted(
	() => {
		const connect = vi.fn();
		const ping = vi.fn();
		const quit = vi.fn();
		const disconnect = vi.fn();
		const mockClient = {
			connect,
			ping,
			quit,
			disconnect,
			on: vi.fn(),
		};
		const RedisMock = vi.fn(() => mockClient);

		return { mockClient, RedisMock, connect, ping, quit, disconnect };
	},
);

vi.mock("ioredis", () => ({
	Redis: RedisMock,
}));

describe("RedisService", () => {
	let moduleRef: TestingModule;
	let redisService: RedisService;
	let configGet: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		vi.clearAllMocks();
		connect.mockResolvedValue(undefined);
		ping.mockResolvedValue("PONG");
		quit.mockResolvedValue("OK");

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
	});

	it("stays disconnected when REDIS_URL is missing", async () => {
		configGet.mockReturnValue(undefined);

		await redisService.onModuleInit();

		expect(RedisMock).not.toHaveBeenCalled();
		await expect(redisService.ping()).resolves.toBe(false);
	});

	it("connects one client and answers ping", async () => {
		configGet.mockReturnValue("redis://localhost:6379");

		await redisService.onModuleInit();

		expect(RedisMock).toHaveBeenCalledOnce();
		expect(RedisMock).toHaveBeenCalledWith(
			"redis://localhost:6379",
			expect.objectContaining({
				lazyConnect: true,
				maxRetriesPerRequest: 1,
				enableOfflineQueue: false,
			}),
		);
		expect(connect).toHaveBeenCalledOnce();
		expect(mockClient.on).toHaveBeenCalledWith("error", expect.any(Function));
		await expect(redisService.ping()).resolves.toBe(true);
		expect(ping).toHaveBeenCalledOnce();
	});

	it("keeps the client when the first connect fails", async () => {
		configGet.mockReturnValue("redis://localhost:6379");
		connect.mockRejectedValueOnce(new Error("ECONNREFUSED"));
		ping.mockRejectedValueOnce(new Error("ECONNREFUSED"));

		await redisService.onModuleInit();

		await expect(redisService.ping()).resolves.toBe(false);
		expect(RedisMock).toHaveBeenCalledOnce();
	});

	it("returns false when ping does not answer PONG", async () => {
		configGet.mockReturnValue("redis://localhost:6379");
		await redisService.onModuleInit();
		ping.mockResolvedValueOnce("LOADING");

		await expect(redisService.ping()).resolves.toBe(false);
	});

	it("quits the client on destroy", async () => {
		configGet.mockReturnValue("redis://localhost:6379");
		await redisService.onModuleInit();

		await redisService.onModuleDestroy();

		expect(quit).toHaveBeenCalledOnce();
		await expect(redisService.ping()).resolves.toBe(false);
	});

	it("disconnects when quit fails", async () => {
		configGet.mockReturnValue("redis://localhost:6379");
		await redisService.onModuleInit();
		quit.mockRejectedValueOnce(new Error("closed"));

		await redisService.onModuleDestroy();

		expect(disconnect).toHaveBeenCalledOnce();
	});
});
