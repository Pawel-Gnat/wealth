import {
	EXPENSE_DELETED_MESSAGE,
	INCOME_DELETED_MESSAGE,
} from "@repo/api/schemas";
import { HttpResponse, http } from "msw";

const postAuthSignInHandler = () => {
	return HttpResponse.json({
		data: { token: "mock-jwt-access-token" },
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

const getDashboardWidgetsHandler = () => {
	return HttpResponse.json({
		data: {
			expenses: { amount: 100, percentChange: 12.5 },
			incomes: { amount: 250, percentChange: null },
			netBalance: { amount: 150, percentChange: -3.2 },
		},
	});
};

const getDashboardChartHandler = () => {
	return HttpResponse.json({
		data: {
			points: [
				{
					date: "2024-07-01T00:00:00.000Z",
					expensesCumulative: 100,
					incomesCumulative: 50,
				},
			],
		},
	});
};

const postAuthRefreshHandler = () => {
	return HttpResponse.json(
		{ error: { message: "Unauthorized" } },
		{ status: 401 },
	);
};

const postAuthLogoutHandler = () => {
	return HttpResponse.json({
		data: { message: "logged_out" as const },
	});
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
	http.get("*/dashboard/widgets", getDashboardWidgetsHandler),
	http.get("*/dashboard/chart", getDashboardChartHandler),
	http.post("*/auth/signin", postAuthSignInHandler),
	http.post("*/auth/signup", postAuthSignUpHandler),
	http.post("*/auth/refresh", postAuthRefreshHandler),
	http.post("*/auth/logout", postAuthLogoutHandler),
];
