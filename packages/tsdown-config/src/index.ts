import { defineConfig, type UserConfig } from "tsdown";

type CreateTsdownConfigOptions = {
	entry: NonNullable<UserConfig["entry"]>;
} & Omit<UserConfig, "entry">;

export const createTsdownConfig = ({
	entry,
	...overrides
}: CreateTsdownConfigOptions) =>
	defineConfig({
		format: "esm",
		target: "es2023",
		outDir: "dist",
		sourcemap: true,
		dts: {
			sourcemap: true,
		},
		treeshake: true,
		fixedExtension: false,
		entry,
		...overrides,
	});
