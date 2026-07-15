import { Inject, Injectable } from "@nestjs/common";
import {
	type ChartPeriod,
	type DashboardChartResponse,
	type DashboardWidgetsResponse,
} from "@repo/api/schemas";
import {
	decodeDocumentDateFromStorage,
	encodeDocumentDateForStorage,
} from "@repo/common/helpers";
import { and, eq, gte, lte } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants.js";
import {
	expenseDocumentsTable,
	incomeDocumentsTable,
} from "../database-service/tables/index.js";
import type { AmountRow } from "./types/amount-row.js";

@Injectable()
export class DashboardService {
	constructor(@Inject(DBS.APP) private readonly db: NodePgDatabase) {}

	async getWidgets(userId: string): Promise<DashboardWidgetsResponse> {
		const today = encodeDocumentDateForStorage(new Date());
		const currentMonthStart = this.getCurrentMonthStart(today);
		const previousPeriod = this.getPreviousPeriodBounds(today);

		const [expenseRows, incomeRows] = await Promise.all([
			this.fetchAmountRows(userId, previousPeriod.start, today, "expense"),
			this.fetchAmountRows(userId, previousPeriod.start, today, "income"),
		]);

		const currentDays = this.countDaysInRange(currentMonthStart, today);
		const previousDays = this.countDaysInRange(
			previousPeriod.start,
			previousPeriod.end,
		);

		const currentExpenses = this.sumAmountsInRange(
			expenseRows,
			currentMonthStart,
			today,
		);
		const previousExpenses = this.sumAmountsInRange(
			expenseRows,
			previousPeriod.start,
			previousPeriod.end,
		);

		const currentIncomes = this.sumAmountsInRange(
			incomeRows,
			currentMonthStart,
			today,
		);
		const previousIncomes = this.sumAmountsInRange(
			incomeRows,
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

	async getChart(
		userId: string,
		chartPeriod: ChartPeriod,
	): Promise<DashboardChartResponse> {
		const today = encodeDocumentDateForStorage(new Date());
		const periodStart =
			chartPeriod === "week"
				? this.getCurrentWeekStart(today)
				: this.getCurrentMonthStart(today);

		const [expenseRows, incomeRows] = await Promise.all([
			this.fetchAmountRows(userId, periodStart, today, "expense"),
			this.fetchAmountRows(userId, periodStart, today, "income"),
		]);

		const expenseDailyTotals = this.buildDailyTotals(expenseRows);
		const incomeDailyTotals = this.buildDailyTotals(incomeRows);
		const dates = this.enumerateDates(periodStart, today);

		let expensesCumulative = 0;
		let incomesCumulative = 0;

		const points = dates.map((date) => {
			expensesCumulative += expenseDailyTotals.get(date) ?? 0;
			incomesCumulative += incomeDailyTotals.get(date) ?? 0;

			return {
				date: decodeDocumentDateFromStorage(date),
				expensesCumulative,
				incomesCumulative,
			};
		});

		return { data: { points } };
	}

	private async fetchAmountRows(
		userId: string,
		rangeStart: string,
		rangeEnd: string,
		documentKind: "expense" | "income",
	): Promise<AmountRow[]> {
		const table =
			documentKind === "expense" ? expenseDocumentsTable : incomeDocumentsTable;
		const dateColumn =
			documentKind === "expense"
				? expenseDocumentsTable.expenseDate
				: incomeDocumentsTable.incomeDate;

		const rows = await this.db
			.select({
				date: dateColumn,
				amount: table.totalAmount,
			})
			.from(table)
			.where(
				and(
					eq(table.userId, userId),
					gte(dateColumn, rangeStart),
					lte(dateColumn, rangeEnd),
				),
			);

		return rows.map((row) => ({
			date: row.date,
			amount: Number(row.amount),
		}));
	}

	private getCurrentMonthStart(today: string): string {
		return `${today.slice(0, 7)}-01`;
	}

	private getCurrentWeekStart(today: string): string {
		const date = decodeDocumentDateFromStorage(today);
		const dayOfWeek = date.getUTCDay();
		const daysFromMonday = (dayOfWeek + 6) % 7;

		return this.addDaysToStoredDate(today, -daysFromMonday);
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

	private sumAmountsInRange(
		rows: AmountRow[],
		rangeStart: string,
		rangeEnd: string,
	): number {
		return rows
			.filter((row) => row.date >= rangeStart && row.date <= rangeEnd)
			.reduce((sum, row) => sum + row.amount, 0);
	}

	private buildDailyTotals(rows: AmountRow[]): Map<string, number> {
		const totals = new Map<string, number>();

		for (const row of rows) {
			totals.set(row.date, (totals.get(row.date) ?? 0) + row.amount);
		}

		return totals;
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

		return ((avgCurrent - avgPrevious) / avgPrevious) * 100;
	}
}
