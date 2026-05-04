import { Inject, Injectable } from "@nestjs/common";
import type { ExpenseDocumentListResponse } from "@repo/api/schemas";
import { desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants.js";
import { expenseDocumentsTable } from "../database-service/tables/index.js";

@Injectable()
export class ExpensesService {
	constructor(@Inject(DBS.APP) private readonly db: NodePgDatabase) {}

	async listExpenseDocumentsByUserId(
		userId: number,
	): Promise<ExpenseDocumentListResponse> {
		const rows = await this.db
			.select()
			.from(expenseDocumentsTable)
			.where(eq(expenseDocumentsTable.userId, userId))
			.orderBy(desc(expenseDocumentsTable.createdAt));

		return {
			data: rows.map((row) => ({
				slug: row.slug,
				date: row.createdAt,
				totalAmount: Number(row.totalAmount),
			})),
			pagination: {},
		};
	}
}
