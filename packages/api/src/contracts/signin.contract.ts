import { oc } from "@orpc/contract";
import { sessionSnapshotResponseSchema } from "../schemas/session.schema";
import { signInPayloadSchema } from "../schemas/signin.schema";

export const signInContract = oc
	.route({ method: "POST", path: "/auth/signin" })
	.input(signInPayloadSchema)
	.output(sessionSnapshotResponseSchema);
