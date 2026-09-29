import { populateContractRouterPaths } from "@orpc/contract";
import {
	createBudgetContract,
	listBudgetDocumentsContract,
	listBudgetInvitesContract,
	listBudgetsContract,
} from "./budget.contract";
import {
	getDashboardCumulativeChartContract,
	getDashboardDailyChartContract,
	getDashboardSummaryContract,
} from "./dashboard.contract";
import {
	createDocumentContract,
	deleteDocumentContract,
	getDocumentContract,
	listDocumentsContract,
	updateDocumentContract,
} from "./document.contract";
import { userEditAvatarContract } from "./edit-avatar.contract";
import { userEditDetailsContract } from "./edit-details.contract";
import { userEditPasswordContract } from "./edit-password.contract";
import { logoutContract } from "./logout.contract";
import { meContract } from "./me.contract";
import { refreshContract } from "./refresh.contract";
import { searchUsersContract } from "./search-users.contract";
import { signInContract } from "./signin.contract";
import { signUpContract } from "./signup.contract";

export const rpcContract = populateContractRouterPaths({
	user: {
		signIn: signInContract,
		signUp: signUpContract,
		refresh: refreshContract,
		logout: logoutContract,
		me: meContract,
		search: searchUsersContract,
	},
	settings: {
		password: userEditPasswordContract,
		details: userEditDetailsContract,
		avatar: userEditAvatarContract,
	},
	documents: {
		create: createDocumentContract,
		list: listDocumentsContract,
		get: getDocumentContract,
		update: updateDocumentContract,
		delete: deleteDocumentContract,
	},
	budget: {
		list: listBudgetsContract,
		invites: listBudgetInvitesContract,
		create: createBudgetContract,
		documents: listBudgetDocumentsContract,
	},
	dashboard: {
		getSummary: getDashboardSummaryContract,
		getCumulativeChart: getDashboardCumulativeChartContract,
		getDailyChart: getDashboardDailyChartContract,
	},
});
