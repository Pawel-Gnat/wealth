import { AUTH_EVENTS } from "@repo/api/events";
import { delay, HttpResponse, http } from "msw";
import { MOCK_USER } from "../mocks/user";

const ROUTE = "*/audits";

const getAuditsHandler = () => {
	return HttpResponse.json({
		data: [
			{
				id: "01JTZKQX2GT6PHGQER0M8FS6KA",
				actorId: MOCK_USER.id,
				entityId: MOCK_USER.id,
				event: AUTH_EVENTS.signedIn,
				metadata: {},
				createdAt: "2026-10-29T07:14:00.000Z",
			},
		],
	});
};

const getEmptyAuditsHandler = () => {
	return HttpResponse.json({ data: [] });
};

const getErrorAuditsHandler = () => {
	return HttpResponse.json({ message: "Server error" }, { status: 500 });
};

const getLoadingAuditsHandler = async () => {
	await delay("infinite");
	return HttpResponse.json({ data: [] });
};

export const auditHandlers = [http.get(ROUTE, getAuditsHandler)];

export const getAuditsEmptyHandler = http.get(ROUTE, getEmptyAuditsHandler);

export const getAuditsErrorHandler = http.get(ROUTE, getErrorAuditsHandler);

export const getAuditsLoadingHandler = http.get(ROUTE, getLoadingAuditsHandler);
