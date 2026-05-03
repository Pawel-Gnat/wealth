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
				slug: "acme-march-2024",
				totalAmount: 123.45,
				createdAt: "2024-03-01T12:00:00.000Z",
				updatedAt: "2024-03-02T08:00:00.000Z",
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
