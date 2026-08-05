import { Test, type TestingModule } from "@nestjs/testing";
import { decodeDocumentDateFromStorage } from "@repo/common/helpers";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { DBS } from "../database-service/constants.js";
import {
	expenseDocumentsTable,
	incomeDocumentsTable,
} from "../database-service/tables/index.js";
import { createTestUser } from "../test/mocks/users.js";
import { TestModule } from "../test/test.module.js";
import { UsersService } from "../users-service/users.service.js";
import { DashboardService } from "./dashboard.service.js";

const FIXED_TODAY = "2026-07-15T12:00:00.000Z";

describe("Dashboard service", () => {
	let moduleRef: TestingModule;
	let dashboardService: DashboardService;
	let usersService: UsersService;

	beforeAll(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [TestModule],
			providers: [DashboardService],
		}).compile();
		dashboardService = moduleRef.get(DashboardService);
		usersService = moduleRef.get(UsersService);
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(FIXED_TODAY));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("getWidgets", () => {
		it("returns zero amounts and null percentChange when the user has no documents", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "dash-empty",
			});

			await expect(
				dashboardService.getWidgets(user.id, "UTC"),
			).resolves.toEqual({
				data: {
					expenses: { amount: 0, percentChange: null },
					incomes: { amount: 0, percentChange: null },
					netBalance: { amount: 0, percentChange: null },
				},
			});
		});

		it("aggregates current-month totals and net balance", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-widgets-sum",
			});

			await db.insert(expenseDocumentsTable).values([
				{
					userId: user.id,
					totalAmount: "100",
					expenseDate: "2026-07-01",
				},
				{
					userId: user.id,
					totalAmount: "50",
					expenseDate: "2026-07-10",
				},
			]);

			await db.insert(incomeDocumentsTable).values({
				userId: user.id,
				totalAmount: "300",
				incomeDate: "2026-07-05",
			});

			const result = await dashboardService.getWidgets(user.id, "UTC");

			expect(result.data.expenses.amount).toBe(150);
			expect(result.data.incomes.amount).toBe(300);
			expect(result.data.netBalance.amount).toBe(150);
		});

		it("returns percentChange null when the previous period average is zero", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-null-pct",
			});

			await db.insert(expenseDocumentsTable).values({
				userId: user.id,
				totalAmount: "200",
				expenseDate: "2026-07-10",
			});

			const result = await dashboardService.getWidgets(user.id, "UTC");

			expect(result.data.expenses.percentChange).toBeNull();
		});

		it("calculates percentChange from daily averages", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-pct",
			});

			await db.insert(expenseDocumentsTable).values([
				{
					userId: user.id,
					totalAmount: "150",
					expenseDate: "2026-06-01",
				},
				{
					userId: user.id,
					totalAmount: "300",
					expenseDate: "2026-07-01",
				},
			]);

			const result = await dashboardService.getWidgets(user.id, "UTC");

			const previousDays = 15;
			const currentDays = 15;
			const avgPrevious = 150 / previousDays;
			const avgCurrent = 300 / currentDays;
			const expected =
				((avgCurrent - avgPrevious) / Math.abs(avgPrevious)) * 100;

			expect(result.data.expenses.percentChange).toBe(expected);
		});

		it("keeps net balance percentChange direction when previous average is negative", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-neg-net",
			});

			await db.insert(expenseDocumentsTable).values([
				{
					userId: user.id,
					totalAmount: "300",
					expenseDate: "2026-06-01",
				},
				{
					userId: user.id,
					totalAmount: "100",
					expenseDate: "2026-07-01",
				},
			]);

			const result = await dashboardService.getWidgets(user.id, "UTC");

			const previousDays = 15;
			const currentDays = 15;
			const avgPrevious = -300 / previousDays;
			const avgCurrent = -100 / currentDays;
			const expected =
				((avgCurrent - avgPrevious) / Math.abs(avgPrevious)) * 100;

			expect(result.data.netBalance.amount).toBe(-100);
			expect(result.data.netBalance.percentChange).toBe(expected);
			expect(result.data.netBalance.percentChange).toBeGreaterThan(0);
		});

		it("clamps the previous period end when the current day exceeds the previous month length", async () => {
			vi.setSystemTime(new Date("2026-03-31T12:00:00.000Z"));

			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-clamp",
			});

			await db.insert(expenseDocumentsTable).values([
				{
					userId: user.id,
					totalAmount: "280",
					expenseDate: "2026-02-28",
				},
				{
					userId: user.id,
					totalAmount: "100",
					expenseDate: "2026-03-15",
				},
			]);

			const result = await dashboardService.getWidgets(user.id, "UTC");

			const previousDays = 28;
			const currentDays = 31;
			const avgPrevious = 280 / previousDays;
			const avgCurrent = 100 / currentDays;
			const expected =
				((avgCurrent - avgPrevious) / Math.abs(avgPrevious)) * 100;

			expect(result.data.expenses.percentChange).toBe(expected);
		});

		it("excludes documents dated after today", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-future",
			});

			await db.insert(expenseDocumentsTable).values([
				{
					userId: user.id,
					totalAmount: "100",
					expenseDate: "2026-07-15",
				},
				{
					userId: user.id,
					totalAmount: "999",
					expenseDate: "2026-07-16",
				},
			]);

			const result = await dashboardService.getWidgets(user.id, "UTC");

			expect(result.data.expenses.amount).toBe(100);
		});

		it("uses the client time zone for the today boundary", async () => {
			vi.setSystemTime(new Date("2026-07-15T23:30:00.000Z"));

			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-tz-boundary",
			});

			await db.insert(expenseDocumentsTable).values([
				{
					userId: user.id,
					totalAmount: "100",
					expenseDate: "2026-07-15",
				},
				{
					userId: user.id,
					totalAmount: "50",
					expenseDate: "2026-07-16",
				},
			]);

			const utcResult = await dashboardService.getWidgets(user.id, "UTC");
			const warsawResult = await dashboardService.getWidgets(
				user.id,
				"Europe/Warsaw",
			);

			expect(utcResult.data.expenses.amount).toBe(100);
			expect(warsawResult.data.expenses.amount).toBe(150);
		});
	});

	describe("getCumulativeChart", () => {
		it("returns a flat zero line when there is no data", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-chart-empty",
			});

			const result = await dashboardService.getCumulativeChart(
				user.id,
				30,
				"UTC",
			);

			expect(result.data.points.length).toBe(30);
			expect(result.data.points.every((point) => point.expenses === 0)).toBe(
				true,
			);
			expect(result.data.points.every((point) => point.incomes === 0)).toBe(
				true,
			);
		});

		it("builds cumulative series with flat days between entries", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-chart-cum",
			});

			await db.insert(expenseDocumentsTable).values([
				{
					userId: user.id,
					totalAmount: "100",
					expenseDate: "2026-07-01",
				},
				{
					userId: user.id,
					totalAmount: "50",
					expenseDate: "2026-07-03",
				},
			]);

			await db.insert(incomeDocumentsTable).values({
				userId: user.id,
				totalAmount: "200",
				incomeDate: "2026-07-02",
			});

			const result = await dashboardService.getCumulativeChart(
				user.id,
				30,
				"UTC",
			);

			const expensesByDate = new Map(
				result.data.points.map((point) => [
					point.date.toISOString().slice(0, 10),
					point.expenses,
				]),
			);
			const incomesByDate = new Map(
				result.data.points.map((point) => [
					point.date.toISOString().slice(0, 10),
					point.incomes,
				]),
			);

			expect(expensesByDate.get("2026-07-01")).toBe(100);
			expect(expensesByDate.get("2026-07-02")).toBe(100);
			expect(expensesByDate.get("2026-07-03")).toBe(150);
			expect(incomesByDate.get("2026-07-01")).toBe(0);
			expect(incomesByDate.get("2026-07-02")).toBe(200);
			expect(incomesByDate.get("2026-07-03")).toBe(200);
		});

		it("uses a rolling last-30-days window through today", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-chart-30",
			});

			const result = await dashboardService.getCumulativeChart(
				user.id,
				30,
				"UTC",
			);

			expect(result.data.points.length).toBe(30);
			expect(result.data.points[0]?.date).toEqual(
				decodeDocumentDateFromStorage("2026-06-16"),
			);
			expect(result.data.points.at(-1)?.date).toEqual(
				decodeDocumentDateFromStorage("2026-07-15"),
			);
		});

		it("uses a rolling last-7-days window through today", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-chart-7",
			});

			const result = await dashboardService.getCumulativeChart(
				user.id,
				7,
				"UTC",
			);

			expect(result.data.points.length).toBe(7);
			expect(result.data.points[0]?.date).toEqual(
				decodeDocumentDateFromStorage("2026-07-09"),
			);
			expect(result.data.points.at(-1)?.date).toEqual(
				decodeDocumentDateFromStorage("2026-07-15"),
			);
		});
	});

	describe("getDailyChart", () => {
		it("returns flat zeros when there is no data", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-daily-empty",
			});

			const result = await dashboardService.getDailyChart(user.id, 7, "UTC");

			expect(result.data.points.length).toBe(7);
			expect(result.data.points.every((point) => point.expenses === 0)).toBe(
				true,
			);
			expect(result.data.points.every((point) => point.incomes === 0)).toBe(
				true,
			);
		});

		it("returns daily amounts without accumulation", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-daily-sums",
			});

			await db.insert(expenseDocumentsTable).values([
				{
					userId: user.id,
					totalAmount: "100",
					expenseDate: "2026-07-01",
				},
				{
					userId: user.id,
					totalAmount: "50",
					expenseDate: "2026-07-03",
				},
			]);

			await db.insert(incomeDocumentsTable).values({
				userId: user.id,
				totalAmount: "200",
				incomeDate: "2026-07-02",
			});

			const result = await dashboardService.getDailyChart(user.id, 30, "UTC");

			const expensesByDate = new Map(
				result.data.points.map((point) => [
					point.date.toISOString().slice(0, 10),
					point.expenses,
				]),
			);
			const incomesByDate = new Map(
				result.data.points.map((point) => [
					point.date.toISOString().slice(0, 10),
					point.incomes,
				]),
			);

			expect(expensesByDate.get("2026-07-01")).toBe(100);
			expect(expensesByDate.get("2026-07-02")).toBe(0);
			expect(expensesByDate.get("2026-07-03")).toBe(50);
			expect(incomesByDate.get("2026-07-01")).toBe(0);
			expect(incomesByDate.get("2026-07-02")).toBe(200);
			expect(incomesByDate.get("2026-07-03")).toBe(0);
		});

		it("excludes documents before the rolling window", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-daily-outside",
			});

			await db.insert(expenseDocumentsTable).values([
				{
					userId: user.id,
					totalAmount: "999",
					expenseDate: "2026-07-08",
				},
				{
					userId: user.id,
					totalAmount: "50",
					expenseDate: "2026-07-10",
				},
			]);

			await db.insert(incomeDocumentsTable).values({
				userId: user.id,
				totalAmount: "400",
				incomeDate: "2026-07-08",
			});

			const result = await dashboardService.getDailyChart(user.id, 7, "UTC");

			const expensesByDate = new Map(
				result.data.points.map((point) => [
					point.date.toISOString().slice(0, 10),
					point.expenses,
				]),
			);
			const incomesByDate = new Map(
				result.data.points.map((point) => [
					point.date.toISOString().slice(0, 10),
					point.incomes,
				]),
			);

			expect(result.data.points.length).toBe(7);
			expect(expensesByDate.has("2026-07-08")).toBe(false);
			expect(incomesByDate.has("2026-07-08")).toBe(false);
			expect(expensesByDate.get("2026-07-10")).toBe(50);
			expect(
				result.data.points.every(
					(point) => point.expenses !== 999 && point.incomes !== 400,
				),
			).toBe(true);
		});
	});

	describe("integration smoke", () => {
		it("returns expected response shapes for widgets and both charts", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "dash-smoke",
			});

			await db.insert(expenseDocumentsTable).values({
				userId: user.id,
				totalAmount: "75",
				expenseDate: "2026-07-14",
			});

			await db.insert(incomeDocumentsTable).values({
				userId: user.id,
				totalAmount: "125",
				incomeDate: "2026-07-14",
			});

			const widgets = await dashboardService.getWidgets(user.id, "UTC");
			const cumulativeChart = await dashboardService.getCumulativeChart(
				user.id,
				30,
				"UTC",
			);
			const dailyChart = await dashboardService.getDailyChart(
				user.id,
				30,
				"UTC",
			);

			expect(widgets.data).toMatchObject({
				expenses: { amount: 75 },
				incomes: { amount: 125 },
				netBalance: { amount: 50 },
			});
			expect(widgets.data.expenses).toHaveProperty("percentChange");
			expect(cumulativeChart.data.points.length).toBe(30);
			expect(cumulativeChart.data.points.at(-1)).toMatchObject({
				expenses: 75,
				incomes: 125,
			});
			expect(dailyChart.data.points.length).toBe(30);
			expect(
				dailyChart.data.points.find(
					(point) => point.date.toISOString().slice(0, 10) === "2026-07-14",
				),
			).toMatchObject({
				expenses: 75,
				incomes: 125,
			});
		});
	});
});
