import { BUDGET_EVENTS, RECORD_EVENTS } from "@repo/api/events";
import type { Notification } from "@repo/api/types";
import type { IconName } from "@/shared/components";

export const notificationIcon = (event: Notification["event"]): IconName => {
	switch (event) {
		case BUDGET_EVENTS.memberInvited:
			return "addUser";
		case BUDGET_EVENTS.inviteCancelled:
		case BUDGET_EVENTS.inviteRejected:
			return "reject";
		case BUDGET_EVENTS.left:
			return "leave";
		case BUDGET_EVENTS.updated:
		case RECORD_EVENTS.expense.updated:
		case RECORD_EVENTS.income.updated:
			return "edit";
		case BUDGET_EVENTS.deleted:
		case RECORD_EVENTS.expense.deleted:
		case RECORD_EVENTS.income.deleted:
			return "delete";
		default:
			return "add";
	}
};
