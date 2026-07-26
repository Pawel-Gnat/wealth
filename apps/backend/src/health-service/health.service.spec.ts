import { ServiceUnavailableException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PG_POOL_APP } from "../database-service/constants.js";
import { RedisService } from "../redis-service/redis.service.js";
import { HealthService } from "./health.service.js";

describe("HealthService", () => {
	let moduleRef: TestingModule;
	let healthService: HealthService;
	let query: ReturnType<typeof vi.fn>;
	let ping: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		query = vi.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] });
		ping = vi.fn().mockResolvedValue(true);

		moduleRef = await Test.createTestingModule({
			providers: [
				HealthService,
				{
					provide: PG_POOL_APP,
					useValue: { query },
				},
				{
					provide: RedisService,
					useValue: { ping },
				},
			],
		}).compile();

		healthService = moduleRef.get(HealthService);
	});

	afterEach(async () => {
		await moduleRef.close();
		vi.clearAllMocks();
	});

	it("returns ok for liveness without touching the database or redis", () => {
		expect(healthService.getLiveness()).toEqual({ status: "ok" });
		expect(query).not.toHaveBeenCalled();
		expect(ping).not.toHaveBeenCalled();
	});

	it("returns ok for readiness when the database and redis respond", async () => {
		await expect(healthService.getReadiness()).resolves.toEqual({
			status: "ok",
		});
		expect(query).toHaveBeenCalledWith("SELECT 1");
		expect(ping).toHaveBeenCalledTimes(1);
	});

	it("throws a sanitized ServiceUnavailableException when the database ping fails", async () => {
		query.mockRejectedValueOnce(new Error("connection refused to secret-host"));

		const error = await healthService.getReadiness().catch((err) => err);

		expect(error).toBeInstanceOf(ServiceUnavailableException);
		expect(error.getResponse()).toEqual({
			status: "error",
			reason: "database_unavailable",
		});
		expect(ping).not.toHaveBeenCalled();
	});

	it("throws a sanitized ServiceUnavailableException when redis is unavailable", async () => {
		ping.mockResolvedValueOnce(false);

		const error = await healthService.getReadiness().catch((err) => err);

		expect(error).toBeInstanceOf(ServiceUnavailableException);
		expect(error.getResponse()).toEqual({
			status: "error",
			reason: "redis_unavailable",
		});
	});
});
