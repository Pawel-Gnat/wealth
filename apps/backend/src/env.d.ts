declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV?: string;
		PORT: string;
		DATABASE_URL: string;
		/** Redis connection URL for a later read cache. Optional — readiness fails when Redis does not answer. */
		REDIS_URL?: string;
		/** Comma-separated browser origins for CORS. Required in production. */
		CORS_ORIGIN?: string;
		AWS_ENDPOINT_URL_S3: string;
		AWS_ACCESS_KEY_ID: string;
		AWS_SECRET_ACCESS_KEY: string;
		AWS_REGION: string;
		STORAGE_BUCKET: string;
		STORAGE_PUBLIC_URL: string;
		BETTER_STACK_SOURCE_TOKEN?: string;
		BETTER_STACK_INGESTING_HOST?: string;
		BETTER_STACK_ERRORS_DSN?: string;
	}
}
