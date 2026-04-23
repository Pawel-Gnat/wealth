import { oc } from "@orpc/contract";
import {
	signUpPayloadSchema,
	signUpResponseSchema,
} from "../schemas/signup.schema.js";

export const signUpContract = oc
	.route({ method: "POST", path: "/auth/signup" })
	.input(signUpPayloadSchema)
	.output(signUpResponseSchema);
