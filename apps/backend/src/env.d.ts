declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV?: string;
		PORT: string;
		DATABASE_URL: string;
		/** Redis connection URL for SSE pub/sub. Optional — API degrades without live fan-out. */
		REDIS_URL?: string;
		/** Comma-separated browser origins for CORS. Required in production. */
		CORS_ORIGIN?: string;
		STORAGE_ENDPOINT: string;
		STORAGE_REGION: string;
		STORAGE_FORCE_PATH_STYLE?: string;
		STORAGE_BUCKET: string;
		STORAGE_PUBLIC_URL: string;
		STORAGE_ACCESS_KEY: string;
		STORAGE_SECRET_KEY: string;
		BETTER_STACK_SOURCE_TOKEN?: string;
		BETTER_STACK_INGESTING_HOST?: string;
		BETTER_STACK_ERRORS_DSN?: string;
	}
}
