import { ServiceUnavailableException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PG_POOL_APP } from "../database-service/constants.js";
import { HealthService } from "./health.service.js";

describe("HealthService", () => {
	let moduleRef: TestingModule;
	let healthService: HealthService;
	let query: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		query = vi.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] });

		moduleRef = await Test.createTestingModule({
			providers: [
				HealthService,
				{
					provide: PG_POOL_APP,
					useValue: { query },
				},
			],
		}).compile();

		healthService = moduleRef.get(HealthService);
	});

	afterEach(async () => {
		await moduleRef.close();
		vi.clearAllMocks();
	});

	it("returns ok for liveness without touching the database", () => {
		expect(healthService.getLiveness()).toEqual({ status: "ok" });
		expect(query).not.toHaveBeenCalled();
	});

	it("returns ok for readiness when the database responds", async () => {
		await expect(healthService.getReadiness()).resolves.toEqual({
			status: "ok",
		});
		expect(query).toHaveBeenCalledWith("SELECT 1");
	});

	it("throws ServiceUnavailableException when the database ping fails", async () => {
		query.mockRejectedValueOnce(new Error("connection refused"));

		await expect(healthService.getReadiness()).rejects.toThrow(
			ServiceUnavailableException,
		);
	});
});
