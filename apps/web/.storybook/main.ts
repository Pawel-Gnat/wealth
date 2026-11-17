import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const getAbsolutePath = (value: string) =>
	dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));

const config: StorybookConfig = {
	stories: ["../src/shared/**/*.stories.tsx"],
	addons: [getAbsolutePath("@storybook/addon-docs")],
	framework: getAbsolutePath("@storybook/react-vite"),
	staticDirs: ["./public"],
};
export default config;
