import { oc } from "@orpc/contract";
import {
	signInPayloadSchema,
	tokenResponseSchema,
} from "../schemas/signin.schema";

export const signInContract = oc
	.route({ method: "POST", path: "/auth/signin" })
	.input(signInPayloadSchema)
	.output(tokenResponseSchema);
