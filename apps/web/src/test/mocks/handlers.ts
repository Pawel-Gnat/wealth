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

export const HANDLERS = [
	http.post("*/auth/signin", postAuthSignInHandler),
	http.post("*/auth/signup", postAuthSignUpHandler),
];
