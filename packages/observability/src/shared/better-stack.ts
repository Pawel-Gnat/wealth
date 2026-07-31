import type { BetterStackConfig } from "./types.js";

export const hasBetterStackCredentials = (
	betterStack: BetterStackConfig | undefined,
): betterStack is BetterStackConfig =>
	Boolean(
		betterStack?.sourceToken &&
			betterStack.ingestingHost &&
			betterStack.errorsDsn,
	);

export const shouldUseBetterStack = (
	environment: string,
	betterStack: BetterStackConfig | undefined,
): betterStack is BetterStackConfig =>
	environment === "production" && hasBetterStackCredentials(betterStack);

export const toIngestEndpoint = (ingestingHost: string): string =>
	ingestingHost.startsWith("http://") || ingestingHost.startsWith("https://")
		? ingestingHost
		: `https://${ingestingHost}`;
