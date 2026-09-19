import type { z } from "zod";
import type {
	sessionSnapshotResponseSchema,
	sessionSnapshotSchema,
} from "../schemas/session.schema";

export type SessionSnapshot = z.infer<typeof sessionSnapshotSchema>;
export type SessionSnapshotResponse = z.infer<
	typeof sessionSnapshotResponseSchema
>;
