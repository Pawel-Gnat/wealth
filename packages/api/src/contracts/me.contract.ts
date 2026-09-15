import { oc } from "@orpc/contract";
import { sessionSnapshotResponseSchema } from "../schemas/session.schema";

export const meContract = oc
	.route({ method: "GET", path: "/auth/me", successStatus: 200 })
	.output(sessionSnapshotResponseSchema);
