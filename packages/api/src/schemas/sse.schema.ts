import { z } from "zod";

export const sessionEndedEventSchema = z.object({
	type: z.literal("session-ended"),
	targetId: z.string().min(1),
	occurredAt: z.iso.datetime(),
	id: z.string().min(1),
});
export type SessionEndedEvent = z.infer<typeof sessionEndedEventSchema>;

export const sseEventSchema = z.discriminatedUnion("type", [
	sessionEndedEventSchema,
]);
export type SseEvent = z.infer<typeof sseEventSchema>;
