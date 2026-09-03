import { Inject, Injectable } from "@nestjs/common";
import {
	type ChartDays,
	type DashboardChartResponse,
	type SummaryResponse,
} from "@repo/api/schemas";
import {
	decodeDocumentDateFromStorage,
	encodeDocumentDateForStorage,
} from "@repo/common/helpers";
import { and, eq, gte, lte, sum } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants.js";
import {
	expenseDocumentsTable,
	incomeDocumentsTable,
} from "../database-service/tables/index.js";
import { getTodayInTimeZone } from "../shared/time-zone/get-today-in-time-zone.js";
import type { AmountRow } from "./types/amount-row.js";

@Injectable()
export class DashboardService {
	constructor(@Inject(DBS.APP) private readonly db: NodePgDatabase) {}

	async getSummary(userId: string, timeZone: string): Promise<SummaryResponse> {
		const today = getTodayInTimeZone(timeZone);
		const currentMonthStart = this.getCurrentMonthStart(today);
		const previousPeriod = this.getPreviousPeriodBounds(today);

		const [currentExpenses, previousExpenses, currentIncomes, previousIncomes] =
			await Promise.all([
				this.fetchSumInRange(userId, currentMonthStart, today, "expense"),
				this.fetchSumInRange(
					userId,
					previousPeriod.start,
					previousPeriod.end,
					"expense",
				),
				this.fetchSumInRange(userId, currentMonthStart, today, "income"),
				this.fetchSumInRange(
					userId,
					previousPeriod.start,
					previousPeriod.end,
					"income",
				),
			]);

		const currentDays = this.countDaysInRange(currentMonthStart, today);
		const previousDays = this.countDaysInRange(
			previousPeriod.start,
			previousPeriod.end,
		);

		const currentNet = currentIncomes - currentExpenses;
		const previousNet = previousIncomes - previousExpenses;

		return {
			data: {
				expenses: {
					amount: currentExpenses,
					percentChange: this.calcPercentChange(
						currentExpenses,
						currentDays,
						previousExpenses,
						previousDays,
					),
				},
				incomes: {
					amount: currentIncomes,
					percentChange: this.calcPercentChange(
						currentIncomes,
						currentDays,
						previousIncomes,
						previousDays,
					),
				},
				netBalance: {
					amount: currentNet,
					percentChange: this.calcPercentChange(
						currentNet,
						currentDays,
						previousNet,
						previousDays,
					),
				},
			},
		};
	}

	async getCumulativeChart(
		userId: string,
		days: ChartDays,
		timeZone: string,
	): Promise<DashboardChartResponse> {
		const { dates, expenseDailyTotals, incomeDailyTotals } =
			await this.fetchChartDailySeries(userId, days, timeZone);

		let expenses = 0;
		let incomes = 0;

		const points = dates.map((date) => {
			expenses += expenseDailyTotals.get(date) ?? 0;
			incomes += incomeDailyTotals.get(date) ?? 0;

			return {
				date: decodeDocumentDateFromStorage(date),
				expenses,
				incomes,
			};
		});

		return { data: { points } };
	}

	async getDailyChart(
		userId: string,
		days: ChartDays,
		timeZone: string,
	): Promise<DashboardChartResponse> {
		const { dates, expenseDailyTotals, incomeDailyTotals } =
			await this.fetchChartDailySeries(userId, days, timeZone);

		const points = dates.map((date) => ({
			date: decodeDocumentDateFromStorage(date),
			expenses: expenseDailyTotals.get(date) ?? 0,
			incomes: incomeDailyTotals.get(date) ?? 0,
		}));

		return { data: { points } };
	}

	private async fetchChartDailySeries(
		userId: string,
		days: ChartDays,
		timeZone: string,
	) {
		const today = getTodayInTimeZone(timeZone);
		const rangeStart = this.getRollingRangeStart(today, days);

		const [expenseDailyTotals, incomeDailyTotals] = await Promise.all([
			this.fetchDailyTotals(userId, rangeStart, today, "expense"),
			this.fetchDailyTotals(userId, rangeStart, today, "income"),
		]);

		return {
			dates: this.enumerateDates(rangeStart, today),
			expenseDailyTotals,
			incomeDailyTotals,
		};
	}

	private async fetchSumInRange(
		userId: string,
		rangeStart: string,
		rangeEnd: string,
		documentKind: "expense" | "income",
	): Promise<number> {
		const table =
			documentKind === "expense" ? expenseDocumentsTable : incomeDocumentsTable;
		const dateColumn =
			documentKind === "expense"
				? expenseDocumentsTable.expenseDate
				: incomeDocumentsTable.incomeDate;

		const [row] = await this.db
			.select({
				amount: sum(table.totalAmount),
			})
			.from(table)
			.where(
				and(
					eq(table.userId, userId),
					gte(dateColumn, rangeStart),
					lte(dateColumn, rangeEnd),
				),
			);

		return Number(row?.amount ?? 0);
	}

	private async fetchDailyTotals(
		userId: string,
		rangeStart: string,
		rangeEnd: string,
		documentKind: "expense" | "income",
	): Promise<Map<string, number>> {
		const table =
			documentKind === "expense" ? expenseDocumentsTable : incomeDocumentsTable;
		const dateColumn =
			documentKind === "expense"
				? expenseDocumentsTable.expenseDate
				: incomeDocumentsTable.incomeDate;

		const rows = await this.db
			.select({
				date: dateColumn,
				amount: sum(table.totalAmount),
			})
			.from(table)
			.where(
				and(
					eq(table.userId, userId),
					gte(dateColumn, rangeStart),
					lte(dateColumn, rangeEnd),
				),
			)
			.groupBy(dateColumn);

		return this.toDailyTotalsMap(
			rows.map((row) => ({
				date: row.date,
				amount: Number(row.amount ?? 0),
			})),
		);
	}

	private toDailyTotalsMap(rows: AmountRow[]): Map<string, number> {
		const totals = new Map<string, number>();

		for (const row of rows) {
			totals.set(row.date, row.amount);
		}

		return totals;
	}

	private getCurrentMonthStart(today: string): string {
		return `${today.slice(0, 7)}-01`;
	}

	private getRollingRangeStart(today: string, days: ChartDays): string {
		return this.addDaysToStoredDate(today, -(days - 1));
	}

	private getPreviousPeriodBounds(today: string): {
		start: string;
		end: string;
	} {
		const date = decodeDocumentDateFromStorage(today);
		const year = date.getUTCFullYear();
		const month = date.getUTCMonth();
		const day = date.getUTCDate();
		const previousMonth = month === 0 ? 11 : month - 1;
		const previousYear = month === 0 ? year - 1 : year;
		const lastDayOfPreviousMonth = new Date(
			Date.UTC(year, month, 0, 12, 0, 0, 0),
		).getUTCDate();
		const clampedDay = Math.min(day, lastDayOfPreviousMonth);

		return {
			start: encodeDocumentDateForStorage(
				new Date(Date.UTC(previousYear, previousMonth, 1, 12, 0, 0, 0)),
			),
			end: encodeDocumentDateForStorage(
				new Date(
					Date.UTC(previousYear, previousMonth, clampedDay, 12, 0, 0, 0),
				),
			),
		};
	}

	private addDaysToStoredDate(stored: string, days: number): string {
		const date = decodeDocumentDateFromStorage(stored);

		return encodeDocumentDateForStorage(
			new Date(
				Date.UTC(
					date.getUTCFullYear(),
					date.getUTCMonth(),
					date.getUTCDate() + days,
					12,
					0,
					0,
					0,
				),
			),
		);
	}

	private enumerateDates(start: string, end: string): string[] {
		const dates: string[] = [];
		let current = start;

		while (current <= end) {
			dates.push(current);
			current = this.addDaysToStoredDate(current, 1);
		}

		return dates;
	}

	private countDaysInRange(start: string, end: string): number {
		return this.enumerateDates(start, end).length;
	}

	private calcPercentChange(
		currentSum: number,
		currentDays: number,
		previousSum: number,
		previousDays: number,
	): number | null {
		if (previousDays === 0) {
			return null;
		}

		const avgPrevious = previousSum / previousDays;

		if (avgPrevious === 0) {
			return null;
		}

		const avgCurrent = currentSum / currentDays;

		return ((avgCurrent - avgPrevious) / Math.abs(avgPrevious)) * 100;
	}
}
