import { Inject, Injectable } from "@nestjs/common";
import { ORPCError } from "@orpc/nest";
import {
	DOCUMENT_CREATED_MESSAGE,
	DOCUMENT_DELETED_MESSAGE,
	DOCUMENT_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import type {
	BudgetDocumentsResponse,
	DocumentCreatePayload,
	DocumentCreateResponse,
	DocumentDeleteResponse,
	DocumentDetailsResponse,
	DocumentKind,
	DocumentListResponse,
	DocumentUpdateResponse,
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
	documentLineItemsTable,
	documentsTable,
} from "../database-service/tables/index";
import {
	calculateDocumentTotalAmount,
	mapPayloadLineItemsToInsertRows,
} from "../shared/document/document-line-items.helpers";
import { logDocumentSucceeded } from "../shared/observability/log-event";

const documentCopy = {
	expense: {
		notFound: "Expense not found",
		insertFailed: "Expense insert failed",
	},
	income: {
		notFound: "Income not found",
		insertFailed: "Income insert failed",
	},
} as const;

@Injectable()
export class DocumentsService {
	constructor(@Inject(DBS.APP) private readonly db: NodePgDatabase) {}

	async listByUserId(
		userId: string,
		kind: DocumentKind,
	): Promise<DocumentListResponse> {
		const rows = await this.db
			.select()
			.from(documentsTable)
			.where(this.personalScope(userId, kind))
			.orderBy(desc(documentsTable.documentDate));

		return {
			data: rows.map((row) => ({
				id: row.id,
				date: decodeDocumentDateFromStorage(row.documentDate),
				totalAmount: Number(row.totalAmount),
			})),
			pagination: {},
		};
	}

	async getByUserId(
		userId: string,
		documentId: string,
		kind: DocumentKind,
	): Promise<DocumentDetailsResponse> {
		const [document] = await this.db
			.select({
				id: documentsTable.id,
				date: documentsTable.documentDate,
				totalAmount: documentsTable.totalAmount,
			})
			.from(documentsTable)
			.where(this.personalScope(userId, kind, documentId));

		if (!document) {
			this.throwNotFound(kind);
		}

		const lineItems = await this.db
			.select({
				id: documentLineItemsTable.id,
				title: documentLineItemsTable.title,
				quantity: documentLineItemsTable.quantity,
				singleAmount: documentLineItemsTable.singleAmount,
			})
			.from(documentLineItemsTable)
			.where(eq(documentLineItemsTable.documentId, documentId));

		return {
			data: {
				id: document.id,
				date: decodeDocumentDateFromStorage(document.date),
				totalAmount: Number(document.totalAmount),
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
		kind: DocumentKind,
		payload: DocumentCreatePayload,
	): Promise<DocumentCreateResponse> {
		const totalAmount = calculateDocumentTotalAmount(payload);

		await this.db.transaction(async (tx) => {
			const [createdDocument] = await tx
				.insert(documentsTable)
				.values({
					userId,
					budgetId: null,
					kind,
					documentDate: encodeDocumentDateForStorage(payload.date),
					totalAmount: totalAmount.toFixed(2),
				})
				.returning({ id: documentsTable.id });

			if (!createdDocument) {
				throw new Error(documentCopy[kind].insertFailed);
			}

			await tx.insert(documentLineItemsTable).values(
				mapPayloadLineItemsToInsertRows(payload).map((row) => ({
					documentId: createdDocument.id,
					...row,
				})),
			);
		});

		logDocumentSucceeded(kind, "create");

		return { data: { message: DOCUMENT_CREATED_MESSAGE } };
	}

	async updateByUserId(
		userId: string,
		documentId: string,
		kind: DocumentKind,
		payload: DocumentCreatePayload,
	): Promise<DocumentUpdateResponse> {
		const newTotalAmount = calculateDocumentTotalAmount(payload);
		const newTotalAmountStr = newTotalAmount.toFixed(2);

		await this.db.transaction(async (tx) => {
			const [existing] = await tx
				.select({
					id: documentsTable.id,
					documentDate: documentsTable.documentDate,
					totalAmount: documentsTable.totalAmount,
				})
				.from(documentsTable)
				.where(this.personalScope(userId, kind, documentId));

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
					.update(documentsTable)
					.set({
						documentDate: encodeDocumentDateForStorage(payload.date),
						totalAmount: newTotalAmountStr,
						updatedAt: new Date(),
					})
					.where(eq(documentsTable.id, documentId));
			}

			await tx
				.delete(documentLineItemsTable)
				.where(eq(documentLineItemsTable.documentId, documentId));

			await tx.insert(documentLineItemsTable).values(
				mapPayloadLineItemsToInsertRows(payload).map((row) => ({
					documentId,
					...row,
				})),
			);
		});

		logDocumentSucceeded(kind, "update");

		return { data: { message: DOCUMENT_UPDATED_MESSAGE } };
	}

	async deleteByUserId(
		userId: string,
		documentId: string,
		kind: DocumentKind,
	): Promise<DocumentDeleteResponse> {
		const [deletedDocument] = await this.db
			.delete(documentsTable)
			.where(this.personalScope(userId, kind, documentId))
			.returning({ id: documentsTable.id });

		if (!deletedDocument) {
			this.throwNotFound(kind);
		}

		logDocumentSucceeded(kind, "delete");

		return { data: { message: DOCUMENT_DELETED_MESSAGE } };
	}

	async listByBudgetId(
		userId: string,
		budgetId: string,
		kind?: DocumentKind,
	): Promise<BudgetDocumentsResponse> {
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

		const rows = await this.db
			.select({
				id: documentsTable.id,
				date: documentsTable.documentDate,
				totalAmount: documentsTable.totalAmount,
				kind: documentsTable.kind,
			})
			.from(documentsTable)
			.where(
				kind
					? and(
							eq(documentsTable.budgetId, budgetId),
							eq(documentsTable.kind, kind),
						)
					: eq(documentsTable.budgetId, budgetId),
			)
			.orderBy(desc(documentsTable.documentDate));

		return {
			data: rows.map((row) => ({
				id: row.id,
				date: decodeDocumentDateFromStorage(row.date),
				totalAmount: Number(row.totalAmount),
				kind: row.kind,
			})),
		};
	}

	private throwNotFound(kind: DocumentKind): never {
		throw new ORPCError("NOT_FOUND", {
			message: documentCopy[kind].notFound,
		});
	}

	private personalScope(
		userId: string,
		kind: DocumentKind,
		documentId?: string,
	) {
		return and(
			eq(documentsTable.userId, userId),
			eq(documentsTable.kind, kind),
			isNull(documentsTable.budgetId),
			...(documentId ? [eq(documentsTable.id, documentId)] : []),
		);
	}
}
