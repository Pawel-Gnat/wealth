import { z } from "zod";
import { apiPayload } from "./common.schema";

export const USER_CREATED_MESSAGE = "user_created" as const;
export const USER_PASSWORD_UPDATED_MESSAGE = "user_password_updated" as const;
export const USER_DETAILS_UPDATED_MESSAGE = "user_details_updated" as const;
export const USER_AVATAR_UPDATED_MESSAGE = "user_avatar_updated" as const;

export const USER_AVATAR_MAX_SIZE_MB = 5;
export const USER_AVATAR_MAX_SIZE_BYTES = USER_AVATAR_MAX_SIZE_MB * 1024 * 1024;
export const USER_AVATAR_MIME_TYPES = ["image/png", "image/jpeg"] as const;

export const userSchema = z.object({
	id: z.string(),
	email: z.email(),
	image: z.string().min(1).nullable().optional(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
});

const passwordComplexitySchema = z
	.string()
	.min(8, "form:password.min")
	.regex(/[A-Z]/, "form:password.invalid-uppercase")
	.regex(/[a-z]/, "form:password.invalid-lowercase")
	.regex(/[0-9]/, "form:password.invalid-number")
	.regex(/[^A-Za-z0-9]/, "form:password.invalid-special-character");

const firstNameSchema = z.string().trim().max(16, "form:first-name.max");
const lastNameSchema = z.string().trim().max(16, "form:last-name.max");

export const createUserPayloadSchema = z
	.object({
		email: z.email("form:email.invalid").trim().toLowerCase(),
		password: passwordComplexitySchema,
		confirmPassword: z.string(),
		firstName: firstNameSchema.optional(),
		lastName: lastNameSchema.optional(),
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

export const userEditDetailsSchema = z.object({
	firstName: firstNameSchema,
	lastName: lastNameSchema,
});

export const userEditDetailsResponseDataSchema = z.object({
	message: z.literal(USER_DETAILS_UPDATED_MESSAGE),
});

export const userEditDetailsResponseSchema = apiPayload(
	userEditDetailsResponseDataSchema,
);

export const userEditAvatarSchema = z.object({
	avatar: z
		.file({ error: "form:file.required" })
		.mime([...USER_AVATAR_MIME_TYPES], { error: "form:file.invalid-type" })
		.max(USER_AVATAR_MAX_SIZE_BYTES, { error: "form:file.max" }),
});

export const userEditAvatarResponseDataSchema = z.object({
	message: z.literal(USER_AVATAR_UPDATED_MESSAGE),
});

export const userEditAvatarResponseSchema = apiPayload(
	userEditAvatarResponseDataSchema,
);
