import { AUTH_EVENTS } from "./auth-events";
import { BUDGET_EVENTS } from "./budget-events";
import { RECORD_EVENTS } from "./record-events";

export { AUTH_EVENTS } from "./auth-events";
export { BUDGET_EVENTS } from "./budget-events";
export { RECORD_EVENTS } from "./record-events";

export const DOMAIN_EVENTS = {
	auth: AUTH_EVENTS,
	records: RECORD_EVENTS,
	budgets: BUDGET_EVENTS,
} as const;

type EventValues<T> = T[keyof T];

export type DomainEvent =
	| EventValues<typeof AUTH_EVENTS>
	| EventValues<(typeof RECORD_EVENTS)["expense"]>
	| EventValues<(typeof RECORD_EVENTS)["income"]>
	| EventValues<typeof BUDGET_EVENTS>;
