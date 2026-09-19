import type { z } from "zod";
import type { signInPayloadSchema } from "../schemas/signin.schema";

export type SignInPayload = z.infer<typeof signInPayloadSchema>;
