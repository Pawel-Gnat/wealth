import { oc } from "@orpc/contract";
import {
	createUserPayloadSchema,
	createUserResponseSchema,
} from "../schemas/user.schema";

export const signUpContract = oc
	.route({ method: "POST", path: "/auth/signup" })
	.input(createUserPayloadSchema)
	.output(createUserResponseSchema);
