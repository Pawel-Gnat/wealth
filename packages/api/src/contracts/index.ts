import { populateContractRouterPaths } from "@orpc/contract";
import {
	createExpenseContract,
	deleteExpenseContract,
	listExpensesContract,
	updateExpenseContract,
} from "./expenses.contract";
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
		create: createExpenseContract,
		list: listExpensesContract,
		update: updateExpenseContract,
		delete: deleteExpenseContract,
	},
});
