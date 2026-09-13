import { z } from "zod";

export const userSchema = z.object({
	id: z.string(),
	email: z.email(),
	image: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;
