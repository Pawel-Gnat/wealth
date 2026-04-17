import { z } from "zod";
import { apiPayload } from "./common.schema";

export const tokenSchema = z.object({
	token: z.string(),
});
export type Token = z.infer<typeof tokenSchema>;

export const tokenResponseSchema = apiPayload(tokenSchema);
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

export const signInPayloadSchema = z.object({
	email: z.email("form:email.invalid"),
	password: z.string().min(1, "form:password.invalid-length"),
});
export type SignInPayload = z.infer<typeof signInPayloadSchema>;

export const signInResponseSchema = apiPayload(tokenSchema);
export type SignInResponse = z.infer<typeof signInResponseSchema>;
