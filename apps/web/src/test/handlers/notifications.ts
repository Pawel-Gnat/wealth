import { delay, HttpResponse, http } from "msw";
import { MOCK_NOTIFICATIONS } from "../mocks/notifications";

const ROUTE = "*/notifications";

const getNotificationsHandler = () => {
	return HttpResponse.json({
		data: [MOCK_NOTIFICATIONS[0]],
	});
};

const getWithDataNotificationsHandler = () => {
	return HttpResponse.json({
		data: MOCK_NOTIFICATIONS,
	});
};

const getEmptyNotificationsHandler = () => {
	return HttpResponse.json({ data: [] });
};

const getErrorNotificationsHandler = () => {
	return HttpResponse.json({ message: "Server error" }, { status: 500 });
};

const getLoadingNotificationsHandler = async () => {
	await delay("infinite");
	return HttpResponse.json({ data: [] });
};

export const notificationHandlers = [http.get(ROUTE, getNotificationsHandler)];

export const getNotificationsWithDataHandler = http.get(
	ROUTE,
	getWithDataNotificationsHandler,
);

export const getNotificationsEmptyHandler = http.get(
	ROUTE,
	getEmptyNotificationsHandler,
);

export const getNotificationsErrorHandler = http.get(
	ROUTE,
	getErrorNotificationsHandler,
);

export const getNotificationsLoadingHandler = http.get(
	ROUTE,
	getLoadingNotificationsHandler,
);
