import { BUDGET_EVENTS, RECORD_EVENTS } from "@repo/api/events";
import type { Notification } from "@repo/api/types";
import { APP_ROUTES } from "@/app/routes";

export const notificationHref = (notification: Notification) => {
	switch (notification.event) {
		case BUDGET_EVENTS.memberInvited:
		case BUDGET_EVENTS.inviteCancelled:
			return `${APP_ROUTES.budgets.list}#invitations`;
		case BUDGET_EVENTS.deleted:
			return APP_ROUTES.budgets.list;
		case RECORD_EVENTS.expense.created:
		case RECORD_EVENTS.income.created:
		case RECORD_EVENTS.expense.updated:
		case RECORD_EVENTS.income.updated:
			return APP_ROUTES.budgets.record(
				notification.metadata.budgetId,
				notification.metadata.recordId,
			);
		default:
			return APP_ROUTES.budgets.view(notification.metadata.budgetId);
	}
};
