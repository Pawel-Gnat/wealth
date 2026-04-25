import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/schemas/index.ts", "src/contracts/index.ts"],
	format: ["esm"],
	target: "es2023",
	outDir: "dist",
	clean: true,
	sourcemap: true,
	dts: true,
	treeshake: true,
	external: ["@orpc/contract", "zod"],
});
