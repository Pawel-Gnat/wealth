/// <reference types="vitest" />

import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import { defineConfig as defineVitestConfig } from "vitest/config";

const viteConfig = defineViteConfig({
	envDir: path.resolve(import.meta.dirname, "../.."),
	plugins: [
		react(),
		tailwindcss(),
		...(process.env["ANALYZE"] === "true" ? [analyzer()] : []),
	],
	server: {
		port: 3000,
		strictPort: true,
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
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		coverage: {
			reporter: ["text"],
			exclude: ["node_modules", "dist", "build", "public"],
			include: ["**/*.{test,spec}.{ts,tsx}"],
		},
	},
});

export default mergeConfig(viteConfig, vitestConfig);
