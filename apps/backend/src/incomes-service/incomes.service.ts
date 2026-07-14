import { Inject, Injectable } from "@nestjs/common";
import {
	type DocumentCreatePayload,
	type DocumentDetailsResponse,
	type DocumentListResponse,
	INCOME_CREATED_MESSAGE,
	INCOME_DELETED_MESSAGE,
	INCOME_UPDATED_MESSAGE,
	type IncomeDocumentCreateResponse,
	type IncomeDocumentDeleteResponse,
	type IncomeDocumentUpdateResponse,
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
	incomeDocumentsTable,
	incomeLineItemsTable,
} from "../database-service/tables/index.js";
import {
	calculateDocumentTotalAmount,
	mapPayloadLineItemsToInsertRows,
} from "../shared/document/document-line-items.helpers.js";

@Injectable()
export class IncomesService {
	constructor(@Inject(DBS.APP) private readonly db: NodePgDatabase) {}

	async listIncomeDocumentsByUserId(
		userId: string,
	): Promise<DocumentListResponse> {
		const rows = await this.db
			.select()
			.from(incomeDocumentsTable)
			.where(eq(incomeDocumentsTable.userId, userId))
			.orderBy(desc(incomeDocumentsTable.incomeDate));

		return {
			data: rows.map((row) => ({
				id: row.id,
				date: decodeDocumentDateFromStorage(row.incomeDate),
				totalAmount: Number(row.totalAmount),
			})),
			pagination: {},
		};
	}

	async getIncomeByUserId(
		userId: string,
		incomeId: string,
	): Promise<DocumentDetailsResponse> {
		const [document] = await this.db
			.select({
				id: incomeDocumentsTable.id,
				date: incomeDocumentsTable.incomeDate,
				totalAmount: incomeDocumentsTable.totalAmount,
			})
			.from(incomeDocumentsTable)
			.where(
				and(
					eq(incomeDocumentsTable.id, incomeId),
					eq(incomeDocumentsTable.userId, userId),
				),
			);

		if (!document) {
			throw new Error("Income not found");
		}

		const lineItems = await this.db
			.select({
				title: incomeLineItemsTable.title,
				quantity: incomeLineItemsTable.quantity,
				singleAmount: incomeLineItemsTable.singleAmount,
			})
			.from(incomeLineItemsTable)
			.where(eq(incomeLineItemsTable.incomeDocumentId, incomeId));

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

	async createIncomeByUserId(
		userId: string,
		payload: DocumentCreatePayload,
	): Promise<IncomeDocumentCreateResponse> {
		const totalAmount = calculateDocumentTotalAmount(payload);

		await this.db.transaction(async (tx) => {
			const [createdIncome] = await tx
				.insert(incomeDocumentsTable)
				.values({
					userId,
					incomeDate: encodeDocumentDateForStorage(payload.date),
					totalAmount: totalAmount.toFixed(2),
				})
				.returning({ id: incomeDocumentsTable.id });

			if (!createdIncome) {
				throw new Error("Income insert failed");
			}

			await tx.insert(incomeLineItemsTable).values(
				mapPayloadLineItemsToInsertRows(payload).map((row) => ({
					incomeDocumentId: createdIncome.id,
					...row,
				})),
			);
		});

		return {
			data: {
				message: INCOME_CREATED_MESSAGE,
			},
		};
	}

	async updateIncomeByUserId(
		userId: string,
		incomeId: string,
		payload: DocumentCreatePayload,
	): Promise<IncomeDocumentUpdateResponse> {
		const newTotalAmount = calculateDocumentTotalAmount(payload);
		const newTotalAmountStr = newTotalAmount.toFixed(2);

		await this.db.transaction(async (tx) => {
			const [existing] = await tx
				.select({
					id: incomeDocumentsTable.id,
					incomeDate: incomeDocumentsTable.incomeDate,
					totalAmount: incomeDocumentsTable.totalAmount,
				})
				.from(incomeDocumentsTable)
				.where(
					and(
						eq(incomeDocumentsTable.id, incomeId),
						eq(incomeDocumentsTable.userId, userId),
					),
				);

			if (!existing) {
				throw new Error("Income not found");
			}

			const dateChanged = !isStoredDocumentDateEqual(
				existing.incomeDate,
				payload.date,
			);
			const totalChanged = existing.totalAmount !== newTotalAmountStr;

			if (dateChanged || totalChanged) {
				await tx
					.update(incomeDocumentsTable)
					.set({
						incomeDate: encodeDocumentDateForStorage(payload.date),
						totalAmount: newTotalAmountStr,
						updatedAt: new Date(),
					})
					.where(eq(incomeDocumentsTable.id, incomeId));
			}

			await tx
				.delete(incomeLineItemsTable)
				.where(eq(incomeLineItemsTable.incomeDocumentId, incomeId));

			await tx.insert(incomeLineItemsTable).values(
				mapPayloadLineItemsToInsertRows(payload).map((row) => ({
					incomeDocumentId: incomeId,
					...row,
				})),
			);
		});

		return {
			data: {
				message: INCOME_UPDATED_MESSAGE,
			},
		};
	}

	async deleteIncomeByUserId(
		userId: string,
		incomeId: string,
	): Promise<IncomeDocumentDeleteResponse> {
		const [deletedIncome] = await this.db
			.delete(incomeDocumentsTable)
			.where(
				and(
					eq(incomeDocumentsTable.id, incomeId),
					eq(incomeDocumentsTable.userId, userId),
				),
			)
			.returning({ id: incomeDocumentsTable.id });

		if (!deletedIncome) {
			throw new Error("Income not found");
		}

		return {
			data: {
				message: INCOME_DELETED_MESSAGE,
			},
		};
	}
}
