import { toIngestEndpoint } from "./better-stack.js";
import type { BetterStackConfig, LogSink } from "./types.js";

type LogtailClient = {
	info: (message: string, context: Record<string, unknown>) => unknown;
	warn: (message: string, context: Record<string, unknown>) => unknown;
	error: (message: string, context: Record<string, unknown>) => unknown;
};

type LogtailConstructor = new (
	token: string,
	options: { endpoint: string },
) => LogtailClient;

export const createLogtailLogSink = (
	Logtail: LogtailConstructor,
	betterStack: BetterStackConfig,
): LogSink => {
	const logtail = new Logtail(betterStack.sourceToken, {
		endpoint: toIngestEndpoint(betterStack.ingestingHost),
	});

	return {
		write: (record) => {
			const context = {
				service: record.service,
				environment: record.environment,
				...(record.requestId !== undefined
					? { requestId: record.requestId }
					: {}),
				...(record.userId !== undefined ? { userId: record.userId } : {}),
			};

			switch (record.level) {
				case "warn":
					logtail.warn(record.event, context);
					break;
				case "error":
					logtail.error(record.event, context);
					break;
				default:
					logtail.info(record.event, context);
			}
		},
	};
};
