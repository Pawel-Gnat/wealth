declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV?: string;
		PORT: string;
		DATABASE_URL: string;
		/** Redis connection URL for SSE pub/sub. Optional — API degrades without live fan-out. */
		REDIS_URL?: string;
		JWT_SECRET: string;
		/** Comma-separated browser origins for CORS. Required in production. */
		CORS_ORIGIN?: string;
		BETTER_STACK_SOURCE_TOKEN?: string;
		BETTER_STACK_INGESTING_HOST?: string;
		BETTER_STACK_ERRORS_DSN?: string;
	}
}
