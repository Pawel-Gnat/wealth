import { HttpResponse, http } from "msw";
import { MOCK_USER } from "../mocks/user";

const ROUTE = "*/auth";

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

const postAuthRefreshHandler = () => {
	return HttpResponse.json(
		{ error: { message: "Unauthorized" } },
		{ status: 401 },
	);
};

const postAuthLogoutHandler = () => {
	return new HttpResponse(null, { status: 204 });
};

export const authHandlers = [
	http.get(`${ROUTE}/me`, getAuthMeHandler),
	http.post(`${ROUTE}/signin`, postAuthSignInHandler),
	http.post(`${ROUTE}/signup`, postAuthSignUpHandler),
	http.post(`${ROUTE}/refresh`, postAuthRefreshHandler),
	http.post(`${ROUTE}/logout`, postAuthLogoutHandler),
];
