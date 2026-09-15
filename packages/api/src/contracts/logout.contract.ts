import { oc } from "@orpc/contract";
import { z } from "zod";

export const logoutContract = oc
	.route({ method: "POST", path: "/auth/logout", successStatus: 204 })
	.output(z.void());
