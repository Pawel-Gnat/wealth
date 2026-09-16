import type { z } from "zod";
import type {
	createUserPayloadSchema,
	createUserResponseDataSchema,
	createUserResponseSchema,
	userEditPasswordResponseDataSchema,
	userEditPasswordResponseSchema,
	userEditPasswordSchema,
	userSchema,
} from "../schemas/user.schema";

export type User = z.infer<typeof userSchema>;
export type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;
export type CreateUserResponseData = z.infer<
	typeof createUserResponseDataSchema
>;
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;
export type UserEditPasswordPayload = z.infer<typeof userEditPasswordSchema>;
export type UserEditPasswordResponseData = z.infer<
	typeof userEditPasswordResponseDataSchema
>;
export type UserEditPasswordResponse = z.infer<
	typeof userEditPasswordResponseSchema
>;
