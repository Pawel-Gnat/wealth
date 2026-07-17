import { z } from "zod";
import { apiPayload } from "./common.schema";

export const logoutResponseSchema = apiPayload(
	z.object({
		message: z.literal("logged_out"),
	}),
);
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
