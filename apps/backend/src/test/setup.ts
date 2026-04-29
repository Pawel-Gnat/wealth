import { setupTestDatabase } from "./helpers/db-setup.js";

export default async function globalSetup(): Promise<() => Promise<void>> {
	const { connectionUri, stop } = await setupTestDatabase();
	process.env.DATABASE_URL = connectionUri;

	return async () => {
		await stop();
	};
}
