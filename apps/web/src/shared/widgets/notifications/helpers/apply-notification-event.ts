import type { Notification } from "@repo/api/types";
import type { NotificationSseEvent } from "@/shared/lib/sse";

export const applyNotificationEvent = (
	items: Notification[],
	event: NotificationSseEvent,
) => {
	if (event.type === "notification-created") {
		const rest = items.filter((item) => item.id !== event.notification.id);
		return [event.notification, ...rest];
	}

	if (event.type === "notification-read") {
		return items.map((item) =>
			item.id === event.notificationId
				? { ...item, readAt: event.readAt }
				: item,
		);
	}

	return items.map((item) =>
		item.readAt ? item : { ...item, readAt: event.readAt },
	);
};

export const mergeNotifications = (
	items: Notification[],
	events: NotificationSseEvent[],
) => events.reduce(applyNotificationEvent, items);
