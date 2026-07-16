import { formatInTimeZone } from "date-fns-tz";
import { FALLBACK_TIME_ZONE } from "./constants.js";

export const getTodayInTimeZone = (
	timeZone: string,
	now: Date = new Date(),
) => {
	try {
		return formatInTimeZone(now, timeZone, "yyyy-MM-dd");
	} catch {
		return formatInTimeZone(now, FALLBACK_TIME_ZONE, "yyyy-MM-dd");
	}
};
