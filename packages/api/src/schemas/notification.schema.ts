import { z } from "zod";
import { BUDGET_EVENTS, RECORD_EVENTS } from "../events";
import { apiPayload } from "./common.schema";

export const NOTIFICATION_NOT_FOUND = "Notification not found" as const;

const budgetNotificationMetadataSchema = z.object({
	budgetId: z.string().min(1),
	budgetName: z.string().min(1),
});

const recordNotificationMetadataSchema =
	budgetNotificationMetadataSchema.extend({
		recordId: z.string().min(1),
	});

const notificationEntry = <
	EventName extends string,
	Metadata extends z.ZodType,
>(
	event: EventName,
	metadata: Metadata,
) =>
	z.object({
		id: z.string().min(1),
		event: z.literal(event),
		metadata,
		readAt: z.iso.datetime().nullable(),
		createdAt: z.iso.datetime(),
	});

const budgetNotification = <EventName extends string>(event: EventName) =>
	notificationEntry(event, budgetNotificationMetadataSchema);

const recordNotification = <EventName extends string>(event: EventName) =>
	notificationEntry(event, recordNotificationMetadataSchema);

export const notificationSchema = z.discriminatedUnion("event", [
	budgetNotification(BUDGET_EVENTS.memberInvited),
	budgetNotification(BUDGET_EVENTS.inviteCancelled),
	budgetNotification(BUDGET_EVENTS.inviteRejected),
	budgetNotification(BUDGET_EVENTS.left),
	budgetNotification(BUDGET_EVENTS.updated),
	budgetNotification(BUDGET_EVENTS.deleted),
	recordNotification(RECORD_EVENTS.expense.created),
	recordNotification(RECORD_EVENTS.income.created),
	recordNotification(RECORD_EVENTS.expense.updated),
	recordNotification(RECORD_EVENTS.income.updated),
	budgetNotification(RECORD_EVENTS.expense.deleted),
	budgetNotification(RECORD_EVENTS.income.deleted),
]);

export const notificationListResponseSchema = apiPayload(
	z.array(notificationSchema),
);

export const notificationIdParamsSchema = z.object({
	id: z.string().min(1),
});

export const notificationMarkReadResponseSchema = apiPayload(
	z.object({
		id: z.string().min(1),
		readAt: z.iso.datetime(),
	}),
);

export const notificationMarkAllReadResponseSchema = apiPayload(
	z.object({
		readAt: z.iso.datetime().nullable(),
	}),
);
