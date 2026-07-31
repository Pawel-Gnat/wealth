import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/browser/index.ts", "src/node/index.ts"],
	format: ["esm"],
	target: "es2023",
	outDir: "dist",
	sourcemap: true,
	dts: true,
	treeshake: true,
	external: [
		"@logtail/browser",
		"@logtail/node",
		"@sentry/browser",
		"@sentry/node",
		"node:async_hooks",
	],
});
