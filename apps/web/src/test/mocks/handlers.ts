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

export const HANDLERS = [
	http.get("*/expenses", getExpensesListHandler),
	http.get("*/expenses/:id", getExpenseByIdHandler),
	http.post("*/expenses", postExpenseCreateHandler),
	http.put("*/expenses/:id", putExpenseUpdateHandler),
	http.post("*/auth/signin", postAuthSignInHandler),
	http.post("*/auth/signup", postAuthSignUpHandler),
];
