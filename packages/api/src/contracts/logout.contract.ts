import { oc } from "@orpc/contract";
import { logoutResponseSchema } from "../schemas/logout.schema";

export const logoutContract = oc
	.route({ method: "POST", path: "/auth/logout" })
	.output(logoutResponseSchema);
