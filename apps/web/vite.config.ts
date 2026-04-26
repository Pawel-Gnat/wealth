/// <reference types="vitest" />

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";

const viteConfig = defineViteConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port: 3000,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});

const vitestConfig = defineVitestConfig({
	test: {
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		environment: "jsdom",
		env: {
			VITE_BACKEND_URL: "http://localhost:3000",
		},
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		coverage: {
			reporter: ["text"],
			exclude: ["node_modules", "dist", "build", "public"],
			include: ["**/*.{test,spec}.{ts,tsx}"],
		},
	},
});

export default mergeConfig(viteConfig, vitestConfig);
