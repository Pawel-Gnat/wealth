// https://docs.nestjs.com/recipes/swc#vitest
import { resolve } from "node:path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		root: "./",
		include: ["src/**/*.spec.ts"],
	},
	plugins: [
		swc.vite({
			module: { type: "es6" },
		}),
	],
	resolve: {
		alias: {
			src: resolve(__dirname, "./src"),
		},
	},
});
