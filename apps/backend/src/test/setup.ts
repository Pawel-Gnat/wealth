import { setupTestDatabase } from "./helpers/db-setup";

export default async function globalSetup(): Promise<() => Promise<void>> {
	const { connectionUri, stop } = await setupTestDatabase();
	process.env.DATABASE_URL = connectionUri;

	return async () => {
		await stop();
	};
}
