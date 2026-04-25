import { populateContractRouterPaths } from "@orpc/contract";
import { meContract } from "./me.contract";
import { signInContract } from "./signin.contract";
import { signUpContract } from "./signup.contract";

export const rpcContract = populateContractRouterPaths({
	user: {
		signIn: signInContract,
		signUp: signUpContract,
		me: meContract,
	},
});
