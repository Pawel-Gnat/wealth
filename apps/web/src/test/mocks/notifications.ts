import { BUDGET_EVENTS, RECORD_EVENTS } from "@repo/api/events";
import type { Notification } from "@repo/api/types";
import { MOCK_BUDGET_ID } from "@/test/handlers/budgets";
import { MOCK_USER } from "./user";

const budget = {
	budgetId: MOCK_BUDGET_ID,
	budgetName: "Household",
};

export const MOCK_NOTIFICATIONS = [
	{
		id: "01JTZKQX2GT6PHGQER0M8FS6KD",
		event: BUDGET_EVENTS.memberInvited,
		metadata: budget,
		readAt: null,
		createdAt: "2026-10-29T07:14:00.000Z",
	},
	{
		id: "01JTZKQX2GT6PHGQER0M8FS6KE",
		event: BUDGET_EVENTS.updated,
		metadata: budget,
		readAt: "2026-10-29T08:00:00.000Z",
		createdAt: "2026-10-29T07:20:00.000Z",
	},
	{
		id: "01JTZKQX2GT6PHGQER0M8FS6KF",
		event: RECORD_EVENTS.expense.created,
		metadata: {
			...budget,
			recordId: MOCK_USER.id,
		},
		readAt: null,
		createdAt: "2026-10-29T07:30:00.000Z",
	},
] satisfies Notification[];
