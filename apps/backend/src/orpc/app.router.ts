import { signInRouter } from "./routers/signin.router";
import { signUpRouter } from "./routers/signup.router";

export const appRouter = {
	...signUpRouter,
	...signInRouter,
};
