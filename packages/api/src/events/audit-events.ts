import { AUTH_EVENTS } from "./auth-events";
import { BUDGET_EVENTS } from "./budget-events";
import { RECORD_EVENTS } from "./record-events";

export const AUTH_AUDIT_EVENTS = [
	AUTH_EVENTS.signedIn,
	AUTH_EVENTS.signedUp,
	AUTH_EVENTS.loggedOut,
	AUTH_EVENTS.passwordUpdated,
	AUTH_EVENTS.detailsUpdated,
	AUTH_EVENTS.avatarUpdated,
] as const;

export const RECORD_AUDIT_EVENTS = [
	RECORD_EVENTS.expense.created,
	RECORD_EVENTS.expense.updated,
	RECORD_EVENTS.expense.deleted,
	RECORD_EVENTS.income.created,
	RECORD_EVENTS.income.updated,
	RECORD_EVENTS.income.deleted,
] as const;

export const BUDGET_AUDIT_EVENTS = [
	BUDGET_EVENTS.created,
	BUDGET_EVENTS.updated,
	BUDGET_EVENTS.memberInvited,
	BUDGET_EVENTS.inviteCancelled,
	BUDGET_EVENTS.inviteAccepted,
	BUDGET_EVENTS.inviteRejected,
	BUDGET_EVENTS.left,
	...RECORD_AUDIT_EVENTS,
] as const;

export const AUDIT_EVENTS = [
	...AUTH_AUDIT_EVENTS,
	...BUDGET_AUDIT_EVENTS,
] as const;

export type AuthAuditEvent = (typeof AUTH_AUDIT_EVENTS)[number];
export type RecordAuditEvent = (typeof RECORD_AUDIT_EVENTS)[number];
export type BudgetAuditEvent = (typeof BUDGET_AUDIT_EVENTS)[number];
export type AuditEvent = (typeof AUDIT_EVENTS)[number];
