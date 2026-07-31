import type { SseEvent } from "@repo/api/schemas";
import { sseEventSchema } from "@repo/api/schemas";
import { logger } from "@repo/observability/browser";
import { clearAuthSession } from "@/shared/lib/auth/auth-session";

export const dispatchSseMessage = (raw: string): SseEvent | null => {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		logger.warn("sse.frame.malformed");
		return null;
	}

	const result = sseEventSchema.safeParse(parsed);
	if (!result.success) {
		logger.warn("sse.envelope.invalid");
		return null;
	}

	const event = result.data;

	switch (event.type) {
		case "auth.session-revoked":
			clearAuthSession();
			break;
	}

	return event;
};
