import { createTsdownConfig } from "@repo/tsdown-config";

export default createTsdownConfig({
	entry: ["src/schemas/index.ts", "src/contracts/index.ts"],
});
