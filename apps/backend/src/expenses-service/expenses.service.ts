import { Inject, Injectable } from "@nestjs/common";
import {
	type DocumentCreatePayload,
	type DocumentDetailsResponse,
	type DocumentListResponse,
	EXPENSE_CREATED_MESSAGE,
	EXPENSE_DELETED_MESSAGE,
	EXPENSE_UPDATED_MESSAGE,
	type ExpenseDocumentCreateResponse,
	type ExpenseDocumentDeleteResponse,
	type ExpenseDocumentUpdateResponse,
} from "@repo/api/schemas";
import {
	decodeDocumentDateFromStorage,
	encodeDocumentDateForStorage,
	isStoredDocumentDateEqual,
} from "@repo/common/helpers";
import { and, desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants.js";
import {
	expenseDocumentsTable,
	expenseLineItemsTable,
} from "../database-service/tables/index.js";
import {
	calculateDocumentTotalAmount,
	mapPayloadLineItemsToInsertRows,
} from "../shared/document/document-line-items.helpers.js";

@Injectable()
export class ExpensesService {
	constructor(@Inject(DBS.APP) private readonly db: NodePgDatabase) {}

	async listExpenseDocumentsByUserId(
		userId: string,
	): Promise<DocumentListResponse> {
		const rows = await this.db
			.select()
			.from(expenseDocumentsTable)
			.where(eq(expenseDocumentsTable.userId, userId))
			.orderBy(desc(expenseDocumentsTable.expenseDate));

		return {
			data: rows.map((row) => ({
				id: row.id,
				date: decodeDocumentDateFromStorage(row.expenseDate),
				totalAmount: Number(row.totalAmount),
			})),
			pagination: {},
		};
	}

	async getExpenseByUserId(
		userId: string,
		expenseId: string,
	): Promise<DocumentDetailsResponse> {
		const [document] = await this.db
			.select({
				id: expenseDocumentsTable.id,
				date: expenseDocumentsTable.expenseDate,
				totalAmount: expenseDocumentsTable.totalAmount,
			})
			.from(expenseDocumentsTable)
			.where(
				and(
					eq(expenseDocumentsTable.id, expenseId),
					eq(expenseDocumentsTable.userId, userId),
				),
			);

		if (!document) {
			throw new Error("Expense not found");
		}

		const lineItems = await this.db
			.select({
				title: expenseLineItemsTable.title,
				quantity: expenseLineItemsTable.quantity,
				singleAmount: expenseLineItemsTable.singleAmount,
			})
			.from(expenseLineItemsTable)
			.where(eq(expenseLineItemsTable.expenseDocumentId, expenseId));

		return {
			data: {
				id: document.id,
				date: decodeDocumentDateFromStorage(document.date),
				totalAmount: Number(document.totalAmount),
				lineItems: lineItems.map((lineItem) => ({
					title: lineItem.title,
					quantity: lineItem.quantity,
					singleAmount: Number(lineItem.singleAmount),
				})),
			},
		};
	}

	async createExpenseByUserId(
		userId: string,
		payload: DocumentCreatePayload,
	): Promise<ExpenseDocumentCreateResponse> {
		const totalAmount = calculateDocumentTotalAmount(payload);

		await this.db.transaction(async (tx) => {
			const [createdExpense] = await tx
				.insert(expenseDocumentsTable)
				.values({
					userId,
					expenseDate: encodeDocumentDateForStorage(payload.date),
					totalAmount: totalAmount.toFixed(2),
				})
				.returning({ id: expenseDocumentsTable.id });

			if (!createdExpense) {
				throw new Error("Expense insert failed");
			}

			await tx.insert(expenseLineItemsTable).values(
				mapPayloadLineItemsToInsertRows(payload).map((row) => ({
					expenseDocumentId: createdExpense.id,
					...row,
				})),
			);
		});

		return {
			data: {
				message: EXPENSE_CREATED_MESSAGE,
			},
		};
	}

	async updateExpenseByUserId(
		userId: string,
		expenseId: string,
		payload: DocumentCreatePayload,
	): Promise<ExpenseDocumentUpdateResponse> {
		const newTotalAmount = calculateDocumentTotalAmount(payload);
		const newTotalAmountStr = newTotalAmount.toFixed(2);

		await this.db.transaction(async (tx) => {
			const [existing] = await tx
				.select({
					id: expenseDocumentsTable.id,
					expenseDate: expenseDocumentsTable.expenseDate,
					totalAmount: expenseDocumentsTable.totalAmount,
				})
				.from(expenseDocumentsTable)
				.where(
					and(
						eq(expenseDocumentsTable.id, expenseId),
						eq(expenseDocumentsTable.userId, userId),
					),
				);

			if (!existing) {
				throw new Error("Expense not found");
			}

			const dateChanged = !isStoredDocumentDateEqual(
				existing.expenseDate,
				payload.date,
			);
			const totalChanged = existing.totalAmount !== newTotalAmountStr;

			if (dateChanged || totalChanged) {
				await tx
					.update(expenseDocumentsTable)
					.set({
						expenseDate: encodeDocumentDateForStorage(payload.date),
						totalAmount: newTotalAmountStr,
						updatedAt: new Date(),
					})
					.where(eq(expenseDocumentsTable.id, expenseId));
			}

			await tx
				.delete(expenseLineItemsTable)
				.where(eq(expenseLineItemsTable.expenseDocumentId, expenseId));

			await tx.insert(expenseLineItemsTable).values(
				mapPayloadLineItemsToInsertRows(payload).map((row) => ({
					expenseDocumentId: expenseId,
					...row,
				})),
			);
		});

		return {
			data: {
				message: EXPENSE_UPDATED_MESSAGE,
			},
		};
	}

	async deleteExpenseByUserId(
		userId: string,
		expenseId: string,
	): Promise<ExpenseDocumentDeleteResponse> {
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
				message: EXPENSE_DELETED_MESSAGE,
			},
		};
	}
}
