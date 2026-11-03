import { BUDGET_EVENTS, RECORD_EVENTS } from "@repo/api/events";
import type { Notification } from "@repo/api/types";
import { describe, expect, it } from "vitest";
import { APP_ROUTES } from "@/app/router";
import { notificationHref } from "./notification-href";

const budgetNotification = (
	event: Notification["event"],
	recordId?: string,
): Notification =>
	({
		id: "notification-1",
		event,
		metadata: recordId
			? { budgetId: "budget-1", budgetName: "House", recordId }
			: { budgetId: "budget-1", budgetName: "House" },
		readAt: null,
		createdAt: "2026-07-21T12:00:00.000Z",
	}) as Notification;

describe("notificationHref", () => {
	it("opens the invitations section for an invite and its cancellation", () => {
		expect(
			notificationHref(budgetNotification(BUDGET_EVENTS.memberInvited)),
		).toBe(`${APP_ROUTES.budgets.list}#invitations`);
		expect(
			notificationHref(budgetNotification(BUDGET_EVENTS.inviteCancelled)),
		).toBe(`${APP_ROUTES.budgets.list}#invitations`);
	});

	it("opens the budget list when the budget was deleted", () => {
		expect(notificationHref(budgetNotification(BUDGET_EVENTS.deleted))).toBe(
			APP_ROUTES.budgets.list,
		);
	});

	it("opens the record when it was added or edited", () => {
		expect(
			notificationHref(
				budgetNotification(RECORD_EVENTS.expense.created, "record-1"),
			),
		).toBe(APP_ROUTES.budgets.record("budget-1", "record-1"));
		expect(
			notificationHref(
				budgetNotification(RECORD_EVENTS.income.updated, "record-1"),
			),
		).toBe(APP_ROUTES.budgets.record("budget-1", "record-1"));
	});

	it("opens the budget when a record was deleted", () => {
		expect(
			notificationHref(budgetNotification(RECORD_EVENTS.expense.deleted)),
		).toBe(APP_ROUTES.budgets.view("budget-1"));
	});
});
