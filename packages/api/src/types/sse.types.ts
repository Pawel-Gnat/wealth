import type { z } from "zod";
import type {
	sessionEndedEventSchema,
	sseEventSchema,
} from "../schemas/sse.schema";

export type SessionEndedEvent = z.infer<typeof sessionEndedEventSchema>;
export type SseEvent = z.infer<typeof sseEventSchema>;
