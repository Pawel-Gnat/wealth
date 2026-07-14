import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const uiDir = join(
	dirname(fileURLToPath(import.meta.url)),
	"../src/shared/lib/ui",
);
const files = await readdir(uiDir);

for (const file of files) {
	if (!file.endsWith(".tsx")) continue;

	const path = join(uiDir, file);
	const content = await readFile(path, "utf8");

	if (content.startsWith("// @ts-nocheck")) continue;

	await writeFile(path, `// @ts-nocheck\n${content}`);
}
