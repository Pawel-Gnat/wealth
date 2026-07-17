import { oc } from "@orpc/contract";
import { tokenResponseSchema } from "../schemas/signin.schema";

export const refreshContract = oc
	.route({ method: "POST", path: "/auth/refresh" })
	.output(tokenResponseSchema);
