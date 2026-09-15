import { z } from "zod";
import { apiPayload } from "./common.schema";
import { userSchema } from "./user.schema";

export const sessionSnapshotSchema = z.object({
	user: userSchema,
	sessionExpiresAt: z.iso.datetime(),
});
export type SessionSnapshot = z.infer<typeof sessionSnapshotSchema>;

export const sessionSnapshotResponseSchema = apiPayload(sessionSnapshotSchema);
export type SessionSnapshotResponse = z.infer<
	typeof sessionSnapshotResponseSchema
>;
