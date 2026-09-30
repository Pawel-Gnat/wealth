import {
	RECORD_CREATED_MESSAGE,
	RECORD_DELETED_MESSAGE,
	RECORD_UPDATED_MESSAGE,
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

const getRecordsListHandler = () => {
	return HttpResponse.json({
		data: [
			{
				id: "01JTZKQX2GT6PHGQER0M8FS6K8",
				date: "2024-03-01T12:00:00.000Z",
				kind: "expense",
				totalAmount: 123.45,
			},
		],
		pagination: {},
	});
};

const postRecordCreateHandler = () => {
	return HttpResponse.json({
		data: { message: RECORD_CREATED_MESSAGE },
	});
};

const getRecordByIdHandler = () => {
	return HttpResponse.json({
		data: {
			id: "01JTZKQX2GT6PHGQER0M8FS6K8",
			date: "2024-03-01T12:00:00.000Z",
			kind: "expense",
			totalAmount: 123.45,
			lineItems: [
				{
					id: "01JTZKQX2GT6PHGQER0M8FS6K9",
					title: "Taxi",
					quantity: 1,
					singleAmount: 123.45,
				},
			],
		},
	});
};

const putRecordUpdateHandler = () => {
	return HttpResponse.json({
		data: { message: RECORD_UPDATED_MESSAGE },
	});
};

const deleteRecordHandler = () => {
	return HttpResponse.json({
		data: { message: RECORD_DELETED_MESSAGE },
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
	http.get("*/records/:id", getRecordByIdHandler),
	http.get("*/records", getRecordsListHandler),
	http.post("*/records", postRecordCreateHandler),
	http.put("*/records/:id", putRecordUpdateHandler),
	http.delete("*/records/:id", deleteRecordHandler),
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
