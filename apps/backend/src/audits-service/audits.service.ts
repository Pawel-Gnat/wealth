import { Inject, Injectable } from "@nestjs/common";
import { ORPCError } from "@orpc/nest";
import { AUTH_AUDIT_EVENTS, RECORD_AUDIT_EVENTS } from "@repo/api/events";
import { auditSchema } from "@repo/api/schemas";
import type { AuditsParams } from "@repo/api/types";
import { hasBudgetAccess } from "@repo/common/permissions";
import { and, desc, eq, inArray } from "drizzle-orm";
import { DBS } from "../database-service/constants";
import {
	budgetAuditsTable,
	userAuditsTable,
} from "../database-service/tables/index";
import type {
	Database,
	DatabaseTransaction,
} from "../database-service/types/types";
import { findBudgetAccess } from "../shared/budget/find-budget-access";
import type { BudgetAudit, NewAudit, UserAudit } from "./types/audits";

const BUDGET_NOT_FOUND = "Budget not found";

const belongsTo = (actions: readonly string[], group: readonly string[]) =>
	actions.every((event) => group.includes(event));

const parseAudits = (rows: { createdAt: Date }[]) => ({
	data: rows.flatMap((row) => {
		const parsed = auditSchema.safeParse({
			...row,
			createdAt: row.createdAt.toISOString(),
		});
		return parsed.success ? [parsed.data] : [];
	}),
});

@Injectable()
export class AuditsService {
	constructor(@Inject(DBS.APP) private readonly db: Database) {}

	async createUserAudit(
		tx: DatabaseTransaction,
		entry: NewAudit<UserAudit> & { userId: string },
	) {
		await tx.insert(userAuditsTable).values(entry);
	}

	async createBudgetAudit(
		tx: DatabaseTransaction,
		entry: NewAudit<BudgetAudit> & { budgetId: string; actorUserId: string },
	) {
		await tx.insert(budgetAuditsTable).values(entry);
	}

	async createBudgetAudits(
		tx: DatabaseTransaction,
		entries: (NewAudit<BudgetAudit> & {
			budgetId: string;
			actorUserId: string;
		})[],
	) {
		if (entries.length === 0) {
			return;
		}

		await tx.insert(budgetAuditsTable).values(entries);
	}

	async list(userId: string, params: AuditsParams) {
		const entityId = "entityId" in params ? params.entityId : undefined;
		const actions = [...params.actions];

		if (belongsTo(actions, AUTH_AUDIT_EVENTS)) {
			return this.listUserAudits(userId, actions);
		}

		if (belongsTo(actions, RECORD_AUDIT_EVENTS)) {
			if ("budgetId" in params) {
				return this.listBudgetAudits(
					userId,
					params.budgetId,
					actions,
					entityId,
				);
			}

			return this.listUserAudits(userId, actions, entityId);
		}

		return this.listBudgetAudits(userId, entityId, actions);
	}

	private async listUserAudits(
		userId: string,
		actions: string[],
		entityId?: string,
	) {
		const rows = await this.db
			.select()
			.from(userAuditsTable)
			.where(
				and(
					eq(userAuditsTable.userId, userId),
					inArray(userAuditsTable.event, actions),
					entityId ? eq(userAuditsTable.entityId, entityId) : undefined,
				),
			)
			.orderBy(desc(userAuditsTable.createdAt), desc(userAuditsTable.id));

		return parseAudits(rows.map((row) => ({ ...row, actorId: row.userId })));
	}

	private async listBudgetAudits(
		userId: string,
		budgetId: string | undefined,
		actions: string[],
		recordId?: string,
	) {
		if (!budgetId) {
			throw new ORPCError("NOT_FOUND", { message: BUDGET_NOT_FOUND });
		}

		const access = await findBudgetAccess(this.db, userId, budgetId);
		if (!access || !hasBudgetAccess(userId, access)) {
			throw new ORPCError("NOT_FOUND", { message: BUDGET_NOT_FOUND });
		}

		const rows = await this.db
			.select()
			.from(budgetAuditsTable)
			.where(
				and(
					eq(budgetAuditsTable.budgetId, budgetId),
					inArray(budgetAuditsTable.event, actions),
					recordId ? eq(budgetAuditsTable.entityId, recordId) : undefined,
				),
			)
			.orderBy(desc(budgetAuditsTable.createdAt), desc(budgetAuditsTable.id));

		return parseAudits(
			rows.map((row) => ({ ...row, actorId: row.actorUserId })),
		);
	}
}
