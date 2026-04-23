import { populateContractRouterPaths } from "@orpc/contract";
import { meContract } from "./me.contract.js";
import { signInContract } from "./signin.contract.js";
import { signUpContract } from "./signup.contract.js";

export const rpcContract = populateContractRouterPaths({
	user: {
		signIn: signInContract,
		signUp: signUpContract,
		me: meContract,
	},
});
