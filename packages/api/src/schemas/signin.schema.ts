import { z } from "zod";

export const signInPayloadSchema = z.object({
	email: z.email("form:email.invalid"),
	password: z.string().min(1, "form:password.invalid-length"),
});
export type SignInPayload = z.infer<typeof signInPayloadSchema>;
