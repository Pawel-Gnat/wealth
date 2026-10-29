import { z } from "zod";
import {
	AUTH_AUDIT_EVENTS,
	AUTH_EVENTS,
	BUDGET_AUDIT_EVENTS,
	BUDGET_EVENTS,
	RECORD_AUDIT_EVENTS,
	RECORD_EVENTS,
} from "../events";
import { apiPayload } from "./common.schema";
import { lineItemSchema } from "./record.schema";

const auditLineItemSchema = lineItemSchema.omit({ id: true });

const recordValuesSchema = z.object({
	date: z.iso.date(),
	lineItems: z.array(auditLineItemSchema),
});

const recordSnapshotSchema = recordValuesSchema.extend({
	recordId: z.string().min(1),
});

const recordEditedSchema = z.object({
	recordId: z.string().min(1),
	oldValues: recordValuesSchema,
	newValues: recordValuesSchema,
});

const nameValuesSchema = z.object({
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
});

const titleValuesSchema = z.object({
	title: z.string(),
});

const memberMetadataSchema = z.object({
	userId: z.string().min(1),
});

const emptyMetadataSchema = z.object({});

const editedMetadataSchema = <T extends z.ZodType>(valuesSchema: T) =>
	z.object({
		oldValues: valuesSchema,
		newValues: valuesSchema,
	});

const auditEntry = <EventName extends string, Metadata extends z.ZodType>(
	event: EventName,
	metadata: Metadata,
) =>
	z.object({
		id: z.string().min(1),
		actorId: z.string().min(1).nullable(),
		entityId: z.string().min(1),
		event: z.literal(event),
		metadata,
		createdAt: z.iso.datetime(),
	});

export const auditSchema = z.discriminatedUnion("event", [
	auditEntry(AUTH_EVENTS.signedIn, emptyMetadataSchema),
	auditEntry(AUTH_EVENTS.signedUp, emptyMetadataSchema),
	auditEntry(AUTH_EVENTS.loggedOut, emptyMetadataSchema),
	auditEntry(AUTH_EVENTS.passwordUpdated, emptyMetadataSchema),
	auditEntry(AUTH_EVENTS.avatarUpdated, emptyMetadataSchema),
	auditEntry(
		AUTH_EVENTS.detailsUpdated,
		editedMetadataSchema(nameValuesSchema),
	),
	auditEntry(RECORD_EVENTS.expense.created, recordSnapshotSchema),
	auditEntry(RECORD_EVENTS.income.created, recordSnapshotSchema),
	auditEntry(RECORD_EVENTS.expense.updated, recordEditedSchema),
	auditEntry(RECORD_EVENTS.income.updated, recordEditedSchema),
	auditEntry(RECORD_EVENTS.expense.deleted, recordSnapshotSchema),
	auditEntry(RECORD_EVENTS.income.deleted, recordSnapshotSchema),
	auditEntry(BUDGET_EVENTS.created, titleValuesSchema),
	auditEntry(BUDGET_EVENTS.updated, editedMetadataSchema(titleValuesSchema)),
	auditEntry(BUDGET_EVENTS.memberInvited, memberMetadataSchema),
	auditEntry(BUDGET_EVENTS.inviteCancelled, memberMetadataSchema),
	auditEntry(BUDGET_EVENTS.inviteAccepted, memberMetadataSchema),
	auditEntry(BUDGET_EVENTS.inviteRejected, memberMetadataSchema),
	auditEntry(BUDGET_EVENTS.left, memberMetadataSchema),
]);

export const auditListResponseSchema = apiPayload(z.array(auditSchema));

export const auditsParamsSchema = z.union([
	z.object({
		actions: z.array(z.enum(AUTH_AUDIT_EVENTS)).min(1),
	}),
	z.object({
		actions: z.array(z.enum(RECORD_AUDIT_EVENTS)).min(1),
		entityId: z.string().min(1),
		budgetId: z.string().min(1),
	}),
	z.object({
		actions: z.array(z.enum(RECORD_AUDIT_EVENTS)).min(1),
		entityId: z.string().min(1).optional(),
	}),
	z.object({
		actions: z.array(z.enum(BUDGET_AUDIT_EVENTS)).min(1),
		entityId: z.string().min(1),
	}),
]);
