import { populateContractRouterPaths } from "@orpc/contract";
import { listExpensesContract } from "./expenses.contract";
import { meContract } from "./me.contract";
import { signInContract } from "./signin.contract";
import { signUpContract } from "./signup.contract";

export const rpcContract = populateContractRouterPaths({
	user: {
		signIn: signInContract,
		signUp: signUpContract,
		me: meContract,
	},
	expenses: {
		list: listExpensesContract,
	},
});
