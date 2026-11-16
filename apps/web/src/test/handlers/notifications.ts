import { BUDGET_EVENTS } from "@repo/api/events";
import { HttpResponse, http } from "msw";
import { MOCK_BUDGET_ID } from "./budgets";

const ROUTE = "*/notifications";

const getNotificationsHandler = () => {
	return HttpResponse.json({
		data: [
			{
				id: "01JTZKQX2GT6PHGQER0M8FS6KD",
				event: BUDGET_EVENTS.memberInvited,
				metadata: {
					budgetId: MOCK_BUDGET_ID,
					budgetName: "Household",
				},
				readAt: null,
				createdAt: "2026-10-29T07:14:00.000Z",
			},
		],
	});
};

export const notificationHandlers = [http.get(ROUTE, getNotificationsHandler)];
