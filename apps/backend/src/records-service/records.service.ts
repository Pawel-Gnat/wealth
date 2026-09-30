import { Inject, Injectable } from "@nestjs/common";
import { ORPCError } from "@orpc/nest";
import {
	RECORD_CREATED_MESSAGE,
	RECORD_DELETED_MESSAGE,
	RECORD_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import type {
	BudgetDocumentsResponse,
	RecordCreatePayload,
	RecordCreateResponse,
	RecordDeleteResponse,
	RecordDetailsResponse,
	RecordKind,
	RecordListResponse,
	RecordUpdateResponse,
} from "@repo/api/types";
import {
	decodeDocumentDateFromStorage,
	encodeDocumentDateForStorage,
	isStoredDocumentDateEqual,
} from "@repo/common/helpers";
import { and, desc, eq, isNotNull, isNull, or } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants";
import {
	budgetMemberTable,
	budgetTable,
	recordLineItemsTable,
	recordsTable,
} from "../database-service/tables/index";
import { logDocumentSucceeded } from "../shared/observability/log-event";
import {
	calculateRecordTotalAmount,
	mapPayloadLineItemsToInsertRows,
} from "../shared/record/record-line-items.helpers";

const recordCopy = {
	expense: {
		notFound: "Expense not found",
		insertFailed: "Expense insert failed",
	},
	income: {
		notFound: "Income not found",
		insertFailed: "Income insert failed",
	},
} as const;

const RECORD_NOT_FOUND = "Record not found";

@Injectable()
export class RecordsService {
	constructor(@Inject(DBS.APP) private readonly db: NodePgDatabase) {}

	async listByUserId(
		userId: string,
		kind?: RecordKind,
		budgetId?: string,
	): Promise<RecordListResponse> {
		if (budgetId) {
			await this.assertBudgetAccess(userId, budgetId);
		}

		const rows = await this.db
			.select()
			.from(recordsTable)
			.where(
				budgetId
					? and(
							eq(recordsTable.budgetId, budgetId),
							...(kind ? [eq(recordsTable.kind, kind)] : []),
						)
					: this.personalScope(userId, kind),
			)
			.orderBy(desc(recordsTable.documentDate));

		return {
			data: rows.map((row) => ({
				id: row.id,
				date: decodeDocumentDateFromStorage(row.documentDate),
				kind: row.kind,
				totalAmount: Number(row.totalAmount),
			})),
			pagination: {},
		};
	}

	async getByUserId(
		userId: string,
		recordId: string,
	): Promise<RecordDetailsResponse> {
		const [record] = await this.db
			.select({
				id: recordsTable.id,
				date: recordsTable.documentDate,
				kind: recordsTable.kind,
				totalAmount: recordsTable.totalAmount,
			})
			.from(recordsTable)
			.where(this.personalScope(userId, undefined, recordId));

		if (!record) {
			throw new ORPCError("NOT_FOUND", { message: RECORD_NOT_FOUND });
		}

		const lineItems = await this.db
			.select({
				id: recordLineItemsTable.id,
				title: recordLineItemsTable.title,
				quantity: recordLineItemsTable.quantity,
				singleAmount: recordLineItemsTable.singleAmount,
			})
			.from(recordLineItemsTable)
			.where(eq(recordLineItemsTable.documentId, recordId));

		return {
			data: {
				id: record.id,
				date: decodeDocumentDateFromStorage(record.date),
				kind: record.kind,
				totalAmount: Number(record.totalAmount),
				lineItems: lineItems.map((lineItem) => ({
					id: lineItem.id,
					title: lineItem.title,
					quantity: lineItem.quantity,
					singleAmount: Number(lineItem.singleAmount),
				})),
			},
		};
	}

	async createByUserId(
		userId: string,
		kind: RecordKind,
		payload: RecordCreatePayload,
	): Promise<RecordCreateResponse> {
		const totalAmount = calculateRecordTotalAmount(payload);

		await this.db.transaction(async (tx) => {
			const [createdRecord] = await tx
				.insert(recordsTable)
				.values({
					userId,
					budgetId: null,
					kind,
					documentDate: encodeDocumentDateForStorage(payload.date),
					totalAmount: totalAmount.toFixed(2),
				})
				.returning({ id: recordsTable.id });

			if (!createdRecord) {
				throw new Error(recordCopy[kind].insertFailed);
			}

			await tx.insert(recordLineItemsTable).values(
				mapPayloadLineItemsToInsertRows(payload).map((row) => ({
					documentId: createdRecord.id,
					...row,
				})),
			);
		});

		logDocumentSucceeded(kind, "create");

		return { data: { message: RECORD_CREATED_MESSAGE } };
	}

	async updateByUserId(
		userId: string,
		recordId: string,
		kind: RecordKind,
		payload: RecordCreatePayload,
	): Promise<RecordUpdateResponse> {
		const newTotalAmount = calculateRecordTotalAmount(payload);
		const newTotalAmountStr = newTotalAmount.toFixed(2);

		await this.db.transaction(async (tx) => {
			const [existing] = await tx
				.select({
					id: recordsTable.id,
					documentDate: recordsTable.documentDate,
					totalAmount: recordsTable.totalAmount,
				})
				.from(recordsTable)
				.where(this.personalScope(userId, kind, recordId));

			if (!existing) {
				this.throwNotFound(kind);
			}

			const dateChanged = !isStoredDocumentDateEqual(
				existing.documentDate,
				payload.date,
			);
			const totalChanged = existing.totalAmount !== newTotalAmountStr;

			if (dateChanged || totalChanged) {
				await tx
					.update(recordsTable)
					.set({
						documentDate: encodeDocumentDateForStorage(payload.date),
						totalAmount: newTotalAmountStr,
						updatedAt: new Date(),
					})
					.where(eq(recordsTable.id, recordId));
			}

			await tx
				.delete(recordLineItemsTable)
				.where(eq(recordLineItemsTable.documentId, recordId));

			await tx.insert(recordLineItemsTable).values(
				mapPayloadLineItemsToInsertRows(payload).map((row) => ({
					documentId: recordId,
					...row,
				})),
			);
		});

		logDocumentSucceeded(kind, "update");

		return { data: { message: RECORD_UPDATED_MESSAGE } };
	}

	async deleteByUserId(
		userId: string,
		recordId: string,
		kind: RecordKind,
	): Promise<RecordDeleteResponse> {
		const [deletedRecord] = await this.db
			.delete(recordsTable)
			.where(this.personalScope(userId, kind, recordId))
			.returning({ id: recordsTable.id });

		if (!deletedRecord) {
			this.throwNotFound(kind);
		}

		logDocumentSucceeded(kind, "delete");

		return { data: { message: RECORD_DELETED_MESSAGE } };
	}

	async listByBudgetId(
		userId: string,
		budgetId: string,
		kind?: RecordKind,
	): Promise<BudgetDocumentsResponse> {
		const listed = await this.listByUserId(userId, kind, budgetId);

		return { data: listed.data };
	}

	private async assertBudgetAccess(userId: string, budgetId: string) {
		const [accessibleBudget] = await this.db
			.select({ id: budgetTable.id })
			.from(budgetTable)
			.leftJoin(
				budgetMemberTable,
				and(
					eq(budgetMemberTable.budgetId, budgetTable.id),
					eq(budgetMemberTable.userId, userId),
					eq(budgetMemberTable.status, "active"),
				),
			)
			.where(
				and(
					eq(budgetTable.id, budgetId),
					or(
						eq(budgetTable.ownerId, userId),
						isNotNull(budgetMemberTable.userId),
					),
				),
			);

		if (!accessibleBudget) {
			throw new ORPCError("NOT_FOUND", {
				message: "Budget not found",
			});
		}
	}

	private throwNotFound(kind: RecordKind): never {
		throw new ORPCError("NOT_FOUND", {
			message: recordCopy[kind].notFound,
		});
	}

	private personalScope(userId: string, kind?: RecordKind, recordId?: string) {
		return and(
			eq(recordsTable.userId, userId),
			isNull(recordsTable.budgetId),
			...(kind ? [eq(recordsTable.kind, kind)] : []),
			...(recordId ? [eq(recordsTable.id, recordId)] : []),
		);
	}
}
