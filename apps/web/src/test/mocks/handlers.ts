import {
	DOCUMENT_CREATED_MESSAGE,
	DOCUMENT_DELETED_MESSAGE,
	DOCUMENT_UPDATED_MESSAGE,
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

const getDocumentsListHandler = () => {
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

const postDocumentCreateHandler = () => {
	return HttpResponse.json({
		data: { message: DOCUMENT_CREATED_MESSAGE },
	});
};

const getDocumentByIdHandler = ({ request }: { request: Request }) => {
	const kind = new URL(request.url).searchParams.get("kind");
	const isIncome = kind === "income";

	return HttpResponse.json({
		data: {
			id: "01JTZKQX2GT6PHGQER0M8FS6K8",
			date: "2024-03-01T12:00:00.000Z",
			totalAmount: 123.45,
			lineItems: [
				{
					id: isIncome
						? "01JTZKQX2GT6PHGQER0M8FS6KA"
						: "01JTZKQX2GT6PHGQER0M8FS6K9",
					title: isIncome ? "Salary" : "Taxi",
					quantity: 1,
					singleAmount: 123.45,
				},
			],
		},
	});
};

const putDocumentUpdateHandler = () => {
	return HttpResponse.json({
		data: { message: DOCUMENT_UPDATED_MESSAGE },
	});
};

const deleteDocumentHandler = () => {
	return HttpResponse.json({
		data: { message: DOCUMENT_DELETED_MESSAGE },
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

const getUsersSearchHandler = () => {
	return HttpResponse.json({
		data: [
			{
				id: "01JTZKQX2GT6PHGQER0M8FS6K9",
				email: "anna@example.com",
				firstName: "Anna",
				lastName: "Kowalska",
				image: null,
			},
		],
		hasMore: false,
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
	http.get("*/documents/:id", getDocumentByIdHandler),
	http.get("*/documents", getDocumentsListHandler),
	http.post("*/documents", postDocumentCreateHandler),
	http.put("*/documents/:id", putDocumentUpdateHandler),
	http.delete("*/documents/:id", deleteDocumentHandler),
	http.get("*/dashboard/summary", getDashboardSummaryHandler),
	http.get("*/dashboard/cumulative-chart", getDashboardCumulativeChartHandler),
	http.get("*/dashboard/daily-chart", getDashboardDailyChartHandler),
	http.put("*/settings/details", putSettingsDetailsHandler),
	http.put("*/settings/avatar", putSettingsAvatarHandler),
	http.get("*/users/search", getUsersSearchHandler),
	http.get("*/auth/me", getAuthMeHandler),
	http.post("*/auth/signin", postAuthSignInHandler),
	http.post("*/auth/signup", postAuthSignUpHandler),
	http.post("*/auth/refresh", postAuthRefreshHandler),
	http.post("*/auth/logout", postAuthLogoutHandler),
];
