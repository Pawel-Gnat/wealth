import { FALLBACK_TIME_ZONE } from "./constants.js";

export const resolveClientTimeZone = (value: string | undefined) => {
	const trimmed = value?.trim();

	if (!trimmed) {
		return FALLBACK_TIME_ZONE;
	}

	try {
		Intl.DateTimeFormat(undefined, { timeZone: trimmed });
		return trimmed;
	} catch {
		return FALLBACK_TIME_ZONE;
	}
};
