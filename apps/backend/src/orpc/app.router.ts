import { signInRouter, signUpRouter } from "@repo/api/services";

export const appRouter = {
	...signUpRouter,
	...signInRouter,
};
