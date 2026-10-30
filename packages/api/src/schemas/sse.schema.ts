import { z } from "zod";
import { notificationSchema } from "./notification.schema";

const sseEnvelope = {
	id: z.string().min(1),
	occurredAt: z.iso.datetime(),
};

export const sessionEndedEventSchema = z.object({
	type: z.literal("session-ended"),
	targetId: z.string().min(1),
	...sseEnvelope,
});

export const notificationCreatedEventSchema = z.object({
	type: z.literal("notification-created"),
	notification: notificationSchema,
	...sseEnvelope,
});

export const notificationReadEventSchema = z.object({
	type: z.literal("notification-read"),
	notificationId: z.string().min(1),
	readAt: z.iso.datetime(),
	...sseEnvelope,
});

export const notificationsReadEventSchema = z.object({
	type: z.literal("notifications-read"),
	readAt: z.iso.datetime(),
	...sseEnvelope,
});

export const sseEventSchema = z.discriminatedUnion("type", [
	sessionEndedEventSchema,
	notificationCreatedEventSchema,
	notificationReadEventSchema,
	notificationsReadEventSchema,
]);
