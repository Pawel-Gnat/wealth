import { oc } from "@orpc/contract";
import {
	userEditPasswordResponseSchema,
	userEditPasswordSchema,
} from "../schemas/user.schema";

export const userEditPasswordContract = oc
	.route({ method: "PUT", path: "/auth/password" })
	.input(userEditPasswordSchema)
	.output(userEditPasswordResponseSchema);
