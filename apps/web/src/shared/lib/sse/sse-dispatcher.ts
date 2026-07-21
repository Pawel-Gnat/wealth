import type { SseEvent } from "@repo/api/schemas";
import { sseEventSchema } from "@repo/api/schemas";
import * as Sentry from "@sentry/react";
import { clearAuthSession } from "@/shared/lib/auth/auth-session";

export const dispatchSseMessage = (raw: string): SseEvent | null => {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		Sentry.logger.warn("Ignored malformed SSE JSON frame", {
			log_source: "sse",
		});
		return null;
	}

	const result = sseEventSchema.safeParse(parsed);
	if (!result.success) {
		Sentry.logger.warn("Ignored invalid SSE envelope", {
			log_source: "sse",
		});
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
