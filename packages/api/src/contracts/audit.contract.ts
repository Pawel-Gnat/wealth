import { oc } from "@orpc/contract";
import {
	auditListResponseSchema,
	auditsParamsSchema,
} from "../schemas/audit.schema";

export const listAuditsContract = oc
	.route({ method: "GET", path: "/audits" })
	.input(auditsParamsSchema)
	.output(auditListResponseSchema);
