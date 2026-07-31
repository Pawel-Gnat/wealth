/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_BACKEND_URL: string;
	readonly VITE_BETTER_STACK_SOURCE_TOKEN?: string;
	readonly VITE_BETTER_STACK_INGESTING_HOST?: string;
	readonly VITE_BETTER_STACK_ERRORS_DSN?: string;
}
