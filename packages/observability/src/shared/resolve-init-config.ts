import { shouldUseBetterStack } from "./better-stack";
import type {
	BetterStackConfig,
	ErrorSink,
	LogSink,
	ObservabilityInitConfig,
} from "./types";

type RemoteSinks = {
	logSink: LogSink;
	errorSink: ErrorSink;
};

export const resolveInitConfig = (
	config: ObservabilityInitConfig,
	createRemoteSinks: (betterStack: BetterStackConfig) => RemoteSinks,
): ObservabilityInitConfig => {
	const { betterStack, environment } = config;

	if (
		config.logSink === undefined &&
		config.errorSink === undefined &&
		shouldUseBetterStack(environment, betterStack)
	) {
		return {
			...config,
			...createRemoteSinks(betterStack),
		};
	}

	return config;
};
