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

const getExpensesListSuccessHandler = () => {
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

export const HANDLERS = [
	http.get("*/expenses", getExpensesListSuccessHandler),
	http.post("*/auth/signin", postAuthSignInHandler),
	http.post("*/auth/signup", postAuthSignUpHandler),
];
