import { implement } from "@orpc/server";
import { signInContractService } from "@repo/api/contracts";
import type { OrpcAppContext } from "../context/orpc-app-context";

const os = implement(signInContractService).$context<OrpcAppContext>();

export const signIn = os.signIn.handler(async ({ input, context }) => {
	return context.auth.rpcSignIn(input);
});

export const signInRouter = os.router({
	signIn,
});
