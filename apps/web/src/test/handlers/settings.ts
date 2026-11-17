import {
	USER_AVATAR_UPDATED_MESSAGE,
	USER_DETAILS_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import { HttpResponse, http } from "msw";

const ROUTE = "*/settings";

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

export const settingsHandlers = [
	http.put(`${ROUTE}/details`, putSettingsDetailsHandler),
	http.put(`${ROUTE}/avatar`, putSettingsAvatarHandler),
];
