import type { ErrorSink, LogSink } from "./types.js";

export const createConsoleLogSink = (): LogSink => ({
	write: (record) => {
		const method =
			record.level === "error"
				? "error"
				: record.level === "warn"
					? "warn"
					: "info";
		console[method](record);
	},
});

export const createConsoleErrorSink = (): ErrorSink => ({
	captureException: (error, context) => {
		console.error({
			...context,
			error,
		});
	},
});
