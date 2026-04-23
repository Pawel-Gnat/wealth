declare namespace NodeJS {
	interface ProcessEnv {
		PORT: string;
		DATABASE_URL: string;
		JWT_SECRET: string;
		/** Comma-separated browser origins for CORS (optional; default reflects `Origin`). */
		CORS_ORIGIN?: string;
	}
}
