import { populateContractRouterPaths } from "@orpc/contract";
import {
	getDashboardChartContract,
	getDashboardWidgetsContract,
} from "./dashboard.contract";
import {
	createExpenseContract,
	deleteExpenseContract,
	getExpenseContract,
	listExpensesContract,
	updateExpenseContract,
} from "./expenses.contract";
import {
	createIncomeContract,
	deleteIncomeContract,
	getIncomeContract,
	listIncomesContract,
	updateIncomeContract,
} from "./incomes.contract";
import { logoutContract } from "./logout.contract";
import { meContract } from "./me.contract";
import { refreshContract } from "./refresh.contract";
import { signInContract } from "./signin.contract";
import { signUpContract } from "./signup.contract";

export const rpcContract = populateContractRouterPaths({
	user: {
		signIn: signInContract,
		signUp: signUpContract,
		refresh: refreshContract,
		logout: logoutContract,
		me: meContract,
	},
	expenses: {
		create: createExpenseContract,
		list: listExpensesContract,
		get: getExpenseContract,
		update: updateExpenseContract,
		delete: deleteExpenseContract,
	},
	incomes: {
		create: createIncomeContract,
		list: listIncomesContract,
		get: getIncomeContract,
		update: updateIncomeContract,
		delete: deleteIncomeContract,
	},
	dashboard: {
		getWidgets: getDashboardWidgetsContract,
		getChart: getDashboardChartContract,
	},
});
