import {
	EXPENSE_DELETED_MESSAGE,
	INCOME_DELETED_MESSAGE,
	USER_AVATAR_UPDATED_MESSAGE,
	USER_DETAILS_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import { HttpResponse, http } from "msw";
import { MOCK_USER } from "./user";

const mockSessionSnapshot = {
	user: MOCK_USER,
	sessionExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
};

const postAuthSignInHandler = () => {
	return HttpResponse.json({
		data: mockSessionSnapshot,
	});
};

const getAuthMeHandler = () => {
	return HttpResponse.json({
		data: mockSessionSnapshot,
	});
};

const postAuthSignUpHandler = () => {
	return HttpResponse.json({
		data: { message: "user_created" as const },
	});
};

const getExpensesListHandler = () => {
	return HttpResponse.json({
		data: [
			{
				id: "01JTZKQX2GT6PHGQER0M8FS6K8",
				date: "2024-03-01T12:00:00.000Z",
				totalAmount: 123.45,
			},
		],
		pagination: {},
	});
};

const postExpenseCreateHandler = () => {
	return HttpResponse.json({
		data: { message: "expense_created" as const },
	});
};

const getExpenseByIdHandler = () => {
	return HttpResponse.json({
		data: {
			id: "01JTZKQX2GT6PHGQER0M8FS6K8",
			date: "2024-03-01T12:00:00.000Z",
			totalAmount: 123.45,
			lineItems: [{ title: "Taxi", quantity: 1, singleAmount: 123.45 }],
		},
	});
};

const putExpenseUpdateHandler = () => {
	return HttpResponse.json({
		data: { message: "expense_updated" as const },
	});
};

const deleteExpenseHandler = () => {
	return HttpResponse.json({
		data: { message: EXPENSE_DELETED_MESSAGE },
	});
};

const getIncomesListHandler = () => {
	return HttpResponse.json({
		data: [
			{
				id: "01JTZKQX2GT6PHGQER0M8FS6K8",
				date: "2024-03-01T12:00:00.000Z",
				totalAmount: 123.45,
			},
		],
		pagination: {},
	});
};

const postIncomeCreateHandler = () => {
	return HttpResponse.json({
		data: { message: "income_created" as const },
	});
};

const getIncomeByIdHandler = () => {
	return HttpResponse.json({
		data: {
			id: "01JTZKQX2GT6PHGQER0M8FS6K8",
			date: "2024-03-01T12:00:00.000Z",
			totalAmount: 123.45,
			lineItems: [{ title: "Salary", quantity: 1, singleAmount: 123.45 }],
		},
	});
};

const putIncomeUpdateHandler = () => {
	return HttpResponse.json({
		data: { message: "income_updated" as const },
	});
};

const deleteIncomeHandler = () => {
	return HttpResponse.json({
		data: { message: INCOME_DELETED_MESSAGE },
	});
};

const getDashboardSummaryHandler = () => {
	return HttpResponse.json({
		data: {
			expenses: { amount: 100, percentChange: 12.5 },
			incomes: { amount: 250, percentChange: null },
			netBalance: { amount: 150, percentChange: -3.2 },
		},
	});
};

const getDashboardCumulativeChartHandler = () => {
	return HttpResponse.json({
		data: {
			points: [
				{
					date: "2024-07-01T00:00:00.000Z",
					expenses: 100,
					incomes: 50,
				},
			],
		},
	});
};

const getDashboardDailyChartHandler = () => {
	return HttpResponse.json({
		data: {
			points: [
				{
					date: "2024-07-01T00:00:00.000Z",
					expenses: 40,
					incomes: 25,
				},
			],
		},
	});
};

const putSettingsDetailsHandler = () => {
	return HttpResponse.json({
		data: { message: USER_DETAILS_UPDATED_MESSAGE },
	});
};

const putSettingsAvatarHandler = () => {
	return HttpResponse.json({
		data: { message: USER_AVATAR_UPDATED_MESSAGE },
	});
};

const postAuthRefreshHandler = () => {
	return HttpResponse.json(
		{ error: { message: "Unauthorized" } },
		{ status: 401 },
	);
};

const postAuthLogoutHandler = () => {
	return new HttpResponse(null, { status: 204 });
};

export const HANDLERS = [
	http.get("*/expenses", getExpensesListHandler),
	http.get("*/expenses/:id", getExpenseByIdHandler),
	http.post("*/expenses", postExpenseCreateHandler),
	http.put("*/expenses/:id", putExpenseUpdateHandler),
	http.delete("*/expenses/:id", deleteExpenseHandler),
	http.get("*/incomes", getIncomesListHandler),
	http.get("*/incomes/:id", getIncomeByIdHandler),
	http.post("*/incomes", postIncomeCreateHandler),
	http.put("*/incomes/:id", putIncomeUpdateHandler),
	http.delete("*/incomes/:id", deleteIncomeHandler),
	http.get("*/dashboard/summary", getDashboardSummaryHandler),
	http.get("*/dashboard/cumulative-chart", getDashboardCumulativeChartHandler),
	http.get("*/dashboard/daily-chart", getDashboardDailyChartHandler),
	http.put("*/settings/details", putSettingsDetailsHandler),
	http.put("*/settings/avatar", putSettingsAvatarHandler),
	http.get("*/auth/me", getAuthMeHandler),
	http.post("*/auth/signin", postAuthSignInHandler),
	http.post("*/auth/signup", postAuthSignUpHandler),
	http.post("*/auth/refresh", postAuthRefreshHandler),
	http.post("*/auth/logout", postAuthLogoutHandler),
];
