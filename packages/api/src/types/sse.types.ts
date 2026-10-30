import type { z } from "zod";
import type {
	notificationCreatedEventSchema,
	notificationReadEventSchema,
	notificationsReadEventSchema,
	sessionEndedEventSchema,
	sseEventSchema,
} from "../schemas/sse.schema";

export type SessionEndedEvent = z.infer<typeof sessionEndedEventSchema>;
export type NotificationCreatedEvent = z.infer<
	typeof notificationCreatedEventSchema
>;
export type NotificationReadEvent = z.infer<typeof notificationReadEventSchema>;
export type NotificationsReadEvent = z.infer<
	typeof notificationsReadEventSchema
>;
export type SseEvent = z.infer<typeof sseEventSchema>;
