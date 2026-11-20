import { createTsdownConfig } from "@repo/tsdown-config";

export default createTsdownConfig({
	entry: [
		"src/constants/index.ts",
		"src/schemas/index.ts",
		"src/contracts/index.ts",
		"src/types/index.ts",
		"src/events/index.ts",
	],
});
