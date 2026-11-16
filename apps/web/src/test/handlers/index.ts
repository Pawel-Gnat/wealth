import { auditHandlers } from "./audits";
import { authHandlers } from "./auth";
import { budgetHandlers } from "./budgets";
import { dashboardHandlers } from "./dashboard";
import { notificationHandlers } from "./notifications";
import { recordHandlers } from "./records";
import { settingsHandlers } from "./settings";
import { userHandlers } from "./users";

export const HANDLERS = [
	...recordHandlers,
	...dashboardHandlers,
	...settingsHandlers,
	...userHandlers,
	...budgetHandlers,
	...auditHandlers,
	...notificationHandlers,
	...authHandlers,
];

export {
	getAuditsEmptyHandler,
	getAuditsErrorHandler,
	getAuditsLoadingHandler,
} from "./audits";
export { MOCK_BUDGET_ID, MOCK_MEMBER_BUDGET_ID } from "./budgets";
