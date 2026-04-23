import { oc } from "@orpc/contract";
import { userSchema } from "../schemas/user.schema";

export const meContract = oc
	.route({ method: "GET", path: "/auth/me", successStatus: 200 })
	.output(userSchema);
