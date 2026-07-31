import { init } from "@repo/observability/node";

const environment = process.env.NODE_ENV ?? "development";
const sourceToken = process.env.BETTER_STACK_SOURCE_TOKEN;
const ingestingHost = process.env.BETTER_STACK_INGESTING_HOST;
const errorsDsn = process.env.BETTER_STACK_ERRORS_DSN;

init({
	service: "backend",
	environment,
	...(sourceToken && ingestingHost && errorsDsn
		? {
				betterStack: {
					sourceToken,
					ingestingHost,
					errorsDsn,
				},
			}
		: {}),
});
