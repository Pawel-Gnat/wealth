import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/i18n.ts", "src/helpers/index.ts", "src/constants/index.ts"],
	format: ["esm"],
	target: "es2023",
	outDir: "dist",
	sourcemap: true,
	dts: true,
	treeshake: true,
	external: ["i18next"],
});
