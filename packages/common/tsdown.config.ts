import { createTsdownConfig } from "@repo/tsdown-config";

export default createTsdownConfig({
	entry: ["src/i18n.ts", "src/helpers/index.ts", "src/constants/index.ts"],
});
