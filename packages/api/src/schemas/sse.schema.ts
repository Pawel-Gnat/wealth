import { z } from "zod";

export const sseScopeSchema = z.enum(["session", "user", "group"]);
export type SseScope = z.infer<typeof sseScopeSchema>;

export const authSessionRevokedEventSchema = z.object({
	type: z.literal("auth.session-revoked"),
	// Routing uses scope/targetId; domain payload is reserved for later event types.
	payload: z.object({}),
	scope: z.enum(["session", "user"]),
	targetId: z.string().min(1),
	occurredAt: z.iso.datetime(),
	id: z.string().min(1),
});
export type AuthSessionRevokedEvent = z.infer<
	typeof authSessionRevokedEventSchema
>;

// Future event type names (not in the v1 union): budget.updated, notification.created.
export const sseEventSchema = z.discriminatedUnion("type", [
	authSessionRevokedEventSchema,
]);
export type SseEvent = z.infer<typeof sseEventSchema>;
