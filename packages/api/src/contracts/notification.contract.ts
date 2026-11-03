import { oc } from "@orpc/contract";
import {
	notificationIdParamsSchema,
	notificationListResponseSchema,
	notificationMarkAllReadResponseSchema,
	notificationMarkReadResponseSchema,
} from "../schemas/notification.schema";

export const listNotificationsContract = oc
	.route({ method: "GET", path: "/notifications" })
	.output(notificationListResponseSchema);

export const markNotificationReadContract = oc
	.route({ method: "POST", path: "/notifications/{id}/read" })
	.input(notificationIdParamsSchema)
	.output(notificationMarkReadResponseSchema);

export const markAllNotificationsReadContract = oc
	.route({ method: "POST", path: "/notifications/read" })
	.output(notificationMarkAllReadResponseSchema);
