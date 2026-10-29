import type { z } from "zod";
import type {
	auditListResponseSchema,
	auditSchema,
	auditsParamsSchema,
} from "../schemas/audit.schema";

export type Audit = z.infer<typeof auditSchema>;
export type AuditListResponse = z.infer<typeof auditListResponseSchema>;
export type AuditsParams = z.infer<typeof auditsParamsSchema>;
