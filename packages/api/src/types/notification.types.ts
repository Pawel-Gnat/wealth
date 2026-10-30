import type { z } from "zod";
import type {
	notificationListResponseSchema,
	notificationMarkAllReadResponseSchema,
	notificationMarkReadResponseSchema,
	notificationSchema,
} from "../schemas/notification.schema";

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationListResponse = z.infer<
	typeof notificationListResponseSchema
>;
export type NotificationMarkReadResponse = z.infer<
	typeof notificationMarkReadResponseSchema
>;
export type NotificationMarkAllReadResponse = z.infer<
	typeof notificationMarkAllReadResponseSchema
>;
