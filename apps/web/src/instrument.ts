import { captureException, init } from "@repo/observability/browser";
import { configureWebHttp } from "@/shared/helpers/controlled-fetch";

const environment = import.meta.env.MODE;
const sourceToken = import.meta.env.VITE_BETTER_STACK_SOURCE_TOKEN;
const ingestingHost = import.meta.env.VITE_BETTER_STACK_INGESTING_HOST;
const errorsDsn = import.meta.env.VITE_BETTER_STACK_ERRORS_DSN;

init({
	service: "web",
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

configureWebHttp(captureException);
