declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV?: string;
		PORT: string;
		DATABASE_URL: string;
		JWT_SECRET: string;
		/** Comma-separated browser origins for CORS (optional; default reflects `Origin`). */
		CORS_ORIGIN?: string;
		SENTRY_DSN?: string;
	}
}
