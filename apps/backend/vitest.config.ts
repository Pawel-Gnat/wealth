// https://docs.nestjs.com/recipes/swc#vitest

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

const configDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	test: {
		globals: true,
		root: "./",
		include: ["src/**/*.spec.ts"],
		globalSetup: ["./src/test/setup.ts"],
	},
	plugins: [
		swc.vite({
			module: { type: "es6" },
		}),
	],
	resolve: {
		alias: {
			src: resolve(configDir, "src"),
		},
	},
});
