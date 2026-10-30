import type {
	AuthAuditEvent,
	BudgetAuditEvent,
	RecordAuditEvent,
} from "@repo/api/events";
import type { Audit } from "@repo/api/types";

export type UserAudit = Extract<
	Audit,
	{ event: AuthAuditEvent | RecordAuditEvent }
>;
export type BudgetAudit = Extract<Audit, { event: BudgetAuditEvent }>;

export type NewAudit<T extends Audit> = T extends unknown
	? Omit<T, "id" | "createdAt" | "actorId">
	: never;
