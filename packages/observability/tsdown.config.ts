import { createTsdownConfig } from "@repo/tsdown-config";

export default createTsdownConfig({
	entry: ["src/browser/index.ts", "src/node/index.ts"],
});
