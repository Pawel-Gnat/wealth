import { z } from "zod";
import { apiPayload } from "./common.schema";

export const USER_CREATED_MESSAGE = "user_created" as const;

export const signUpPayloadSchema = z
	.object({
		email: z.email("form:email.invalid").trim().toLowerCase(),
		password: z
			.string()
			.min(8, "form:password.min")
			.regex(/[A-Z]/, "form:password.invalid-uppercase")
			.regex(/[a-z]/, "form:password.invalid-lowercase")
			.regex(/[0-9]/, "form:password.invalid-number")
			.regex(/[^A-Za-z0-9]/, "form:password.invalid-special-character"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "form:confirm-password.mismatch",
		path: ["confirmPassword"],
	});
export type SignUpPayload = z.infer<typeof signUpPayloadSchema>;

export const signUpResponseDataSchema = z.object({
	message: z.literal(USER_CREATED_MESSAGE),
});
export type SignUpResponseData = z.infer<typeof signUpResponseDataSchema>;

export const signUpResponseSchema = apiPayload(signUpResponseDataSchema);
export type SignUpResponse = z.infer<typeof signUpResponseSchema>;
