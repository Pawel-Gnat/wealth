import { init } from "@repo/observability/node";

const environment = process.env.NODE_ENV ?? "development";
const sourceToken = process.env.BETTER_STACK_SOURCE_TOKEN;
const ingestingHost = process.env.BETTER_STACK_INGESTING_HOST;
const errorsDsn = process.env.BETTER_STACK_ERRORS_DSN;
const isProd = environment === "production";

init({
	service: "backend",
	environment,
	...(isProd && sourceToken && ingestingHost && errorsDsn
		? {
				betterStack: {
					sourceToken,
					ingestingHost,
					errorsDsn,
				},
			}
		: {}),
});
