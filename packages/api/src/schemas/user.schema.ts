import { z } from "zod";
import { apiPayload } from "./common.schema";

export const USER_CREATED_MESSAGE = "user_created" as const;
export const USER_PASSWORD_UPDATED_MESSAGE = "user_password_updated" as const;

export const userSchema = z.object({
	id: z.string(),
	email: z.email(),
	image: z.string().optional(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
});

const passwordComplexitySchema = z
	.string()
	.min(8, "form:password.min")
	.regex(/[A-Z]/, "form:password.invalid-uppercase")
	.regex(/[a-z]/, "form:password.invalid-lowercase")
	.regex(/[0-9]/, "form:password.invalid-number")
	.regex(/[^A-Za-z0-9]/, "form:password.invalid-special-character");

export const createUserPayloadSchema = z
	.object({
		email: z.email("form:email.invalid").trim().toLowerCase(),
		password: passwordComplexitySchema,
		confirmPassword: z.string(),
		firstName: z.string().trim().max(16, "form:first-name.max").optional(),
		lastName: z.string().trim().max(16, "form:last-name.max").optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "form:confirm-password.mismatch",
		path: ["confirmPassword"],
	});

export const createUserResponseDataSchema = z.object({
	message: z.literal(USER_CREATED_MESSAGE),
});

export const createUserResponseSchema = apiPayload(
	createUserResponseDataSchema,
);

export const userEditPasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "form:password.invalid-length"),
		newPassword: passwordComplexitySchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "form:confirm-password.mismatch",
		path: ["confirmPassword"],
	});

export const userEditPasswordResponseDataSchema = z.object({
	message: z.literal(USER_PASSWORD_UPDATED_MESSAGE),
});

export const userEditPasswordResponseSchema = apiPayload(
	userEditPasswordResponseDataSchema,
);
