import { Inject, Injectable } from "@nestjs/common";
import type {
	DocumentCreatePayload,
	DocumentCreateResponse,
	DocumentDeleteResponse,
	ExpenseDocumentListResponse,
} from "@repo/api/schemas";
import { and, desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants.js";
import {
	expenseDocumentsTable,
	expenseLineItemsTable,
} from "../database-service/tables/index.js";

@Injectable()
export class ExpensesService {
	constructor(@Inject(DBS.APP) private readonly db: NodePgDatabase) {}

	async listExpenseDocumentsByUserId(
		userId: string,
	): Promise<ExpenseDocumentListResponse> {
		const rows = await this.db
			.select()
			.from(expenseDocumentsTable)
			.where(eq(expenseDocumentsTable.userId, userId))
			.orderBy(desc(expenseDocumentsTable.expenseDate));

		return {
			data: rows.map((row) => ({
				id: row.id,
				date: row.expenseDate,
				totalAmount: Number(row.totalAmount),
			})),
			pagination: {},
		};
	}

	async createExpenseByUserId(
		userId: string,
		payload: DocumentCreatePayload,
	): Promise<DocumentCreateResponse> {
		const totalAmount = payload.lineItems.reduce(
			(sum, item) => sum + item.quantity * item.singleAmount,
			0,
		);
		await this.db.transaction(async (tx) => {
			const [createdExpense] = await tx
				.insert(expenseDocumentsTable)
				.values({
					userId,
					expenseDate: payload.date,
					totalAmount: totalAmount.toFixed(2),
				})
				.returning({ id: expenseDocumentsTable.id });

			if (!createdExpense) {
				throw new Error("Expense insert failed");
			}

			await tx.insert(expenseLineItemsTable).values(
				payload.lineItems.map((lineItem) => ({
					expenseDocumentId: createdExpense.id,
					title: lineItem.title,
					quantity: lineItem.quantity,
					singleAmount: lineItem.singleAmount.toFixed(2),
				})),
			);
		});

		return {
			data: {
				message: "expense_created",
			},
		};
	}

	async deleteExpenseByUserId(
		userId: string,
		expenseId: string,
	): Promise<DocumentDeleteResponse> {
		const [deletedExpense] = await this.db
			.delete(expenseDocumentsTable)
			.where(
				and(
					eq(expenseDocumentsTable.id, expenseId),
					eq(expenseDocumentsTable.userId, userId),
				),
			)
			.returning({ id: expenseDocumentsTable.id });

		if (!deletedExpense) {
			throw new Error("Expense not found");
		}

		return {
			data: {
				message: "expense_deleted",
			},
		};
	}
}
