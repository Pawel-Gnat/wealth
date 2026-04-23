import { implement } from "@orpc/server";
import { signUpContractService } from "@repo/api/contracts";
import type { OrpcAppContext } from "../context/orpc-app-context";

const os = implement(signUpContractService).$context<OrpcAppContext>();

export const signUp = os.signUp.handler(async ({ input, context }) => {
	return context.auth.rpcSignUp(input);
});

export const signUpRouter = os.router({
	signUp,
});
