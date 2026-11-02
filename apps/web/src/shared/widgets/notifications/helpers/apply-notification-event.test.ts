import type { Notification } from "@repo/api/types";
import { describe, expect, it } from "vitest";
import type { NotificationSseEvent } from "@/shared/lib/sse";
import {
	applyNotificationEvent,
	mergeNotifications,
} from "./apply-notification-event";

const notification = (
	id: string,
	createdAt: string,
	readAt: string | null = null,
): Notification =>
	({
		id,
		event: "budget.updated",
		metadata: { budgetId: "budget-1", budgetName: "House" },
		readAt,
		createdAt,
	}) as Notification;

describe("applyNotificationEvent", () => {
	it("keeps one row per id and puts the new notification first", () => {
		const older = notification("a", "2026-07-21T12:00:00.000Z");
		const created: NotificationSseEvent = {
			type: "notification-created",
			id: "event-1",
			occurredAt: "2026-07-21T12:05:00.000Z",
			notification: notification("b", "2026-07-21T12:05:00.000Z"),
		};
		const duplicate: NotificationSseEvent = {
			...created,
			id: "event-2",
			notification: notification("b", "2026-07-21T12:06:00.000Z"),
		};

		expect(
			mergeNotifications([older], [created, duplicate]).map((item) => item.id),
		).toEqual(["b", "a"]);
		expect(
			mergeNotifications([older], [created, duplicate])[0]?.createdAt,
		).toBe("2026-07-21T12:06:00.000Z");
	});

	it("marks one row and then every unread row", () => {
		const unread = notification("a", "2026-07-21T12:02:00.000Z");
		const alreadyRead = notification(
			"b",
			"2026-07-21T12:01:00.000Z",
			"2026-07-21T12:03:00.000Z",
		);
		const items = [unread, alreadyRead];
		const readOne = applyNotificationEvent(items, {
			type: "notification-read",
			id: "event-1",
			occurredAt: "2026-07-21T12:04:00.000Z",
			notificationId: "a",
			readAt: "2026-07-21T12:04:00.000Z",
		});
		const readAll = applyNotificationEvent(
			[notification("a", "2026-07-21T12:02:00.000Z"), alreadyRead],
			{
				type: "notifications-read",
				id: "event-2",
				occurredAt: "2026-07-21T12:05:00.000Z",
				readAt: "2026-07-21T12:05:00.000Z",
			},
		);

		expect(readOne.find((item) => item.id === "a")?.readAt).toBe(
			"2026-07-21T12:04:00.000Z",
		);
		expect(readAll.find((item) => item.id === "b")?.readAt).toBe(
			"2026-07-21T12:03:00.000Z",
		);
		expect(readAll.find((item) => item.id === "a")?.readAt).toBe(
			"2026-07-21T12:05:00.000Z",
		);
	});
});
