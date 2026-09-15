import { oc } from "@orpc/contract";
import { sessionSnapshotResponseSchema } from "../schemas/session.schema";

export const refreshContract = oc
	.route({ method: "POST", path: "/auth/refresh" })
	.output(sessionSnapshotResponseSchema);
