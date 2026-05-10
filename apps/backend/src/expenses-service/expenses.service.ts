import { Inject, Injectable } from "@nestjs/common";
import type {
	DocumentCreatePayload,
	DocumentCreateResponse,
	DocumentDeleteResponse,
	DocumentDetailsResponse,
	DocumentListResponse,
	DocumentUpdateResponse,
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

	private calculateTotalAmount(payload: DocumentCreatePayload): number {
		return payload.lineItems.reduce(
			(sum, item) => sum + item.quantity * item.singleAmount,
			0,
		);
	}

	private toLineItemValues(
		expenseDocumentId: string,
		payload: DocumentCreatePayload,
	) {
		return payload.lineItems.map((lineItem) => ({
			expenseDocumentId,
			title: lineItem.title,
			quantity: lineItem.quantity,
			singleAmount: lineItem.singleAmount.toFixed(2),
		}));
	}

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
				date: row.expenseDate,
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
				date: document.date,
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
	): Promise<DocumentCreateResponse> {
		const totalAmount = this.calculateTotalAmount(payload);
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

			await tx
				.insert(expenseLineItemsTable)
				.values(this.toLineItemValues(createdExpense.id, payload));
		});

		return {
			data: {
				message: "expense_created",
			},
		};
	}

	async updateExpenseByUserId(
		userId: string,
		expenseId: string,
		payload: DocumentCreatePayload,
	): Promise<DocumentUpdateResponse> {
		const newTotalAmount = this.calculateTotalAmount(payload);
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

			const dateChanged =
				existing.expenseDate?.getTime() !== payload.date.getTime();
			const totalChanged = existing.totalAmount !== newTotalAmountStr;

			if (dateChanged || totalChanged) {
				await tx
					.update(expenseDocumentsTable)
					.set({
						expenseDate: payload.date,
						totalAmount: newTotalAmountStr,
						updatedAt: new Date(),
					})
					.where(eq(expenseDocumentsTable.id, expenseId));
			}

			await tx
				.delete(expenseLineItemsTable)
				.where(eq(expenseLineItemsTable.expenseDocumentId, expenseId));

			await tx
				.insert(expenseLineItemsTable)
				.values(this.toLineItemValues(expenseId, payload));
		});

		return {
			data: {
				message: "expense_updated",
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
