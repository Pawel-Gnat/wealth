import type { UserRow } from "../../database/types/types.js";
import type { UsersService } from "../../users/users.service.js";

export function uniqueTestUserEmail(emailTag: string): string {
	return `${emailTag}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@example.com`;
}

type CreateTestUserOptions = {
	passwordHash: string;
	/** Full address; omit to auto-generate with {@link uniqueTestUserEmail}. */
	email?: string;
	/** When `email` is omitted — passed into {@link uniqueTestUserEmail}. */
	emailTag?: string;
};

/**
 * Inserts a row via {@link UsersService.createUser} and returns the persisted row (throws if missing).
 */
export async function createTestUser(
	usersService: UsersService,
	options: CreateTestUserOptions,
): Promise<UserRow> {
	const email =
		options.email ?? uniqueTestUserEmail(options.emailTag ?? "fixture");
	await usersService.createUser(email, options.passwordHash);
	const row = await usersService.findUserByEmail(email);
	if (!row) {
		throw new Error(
			`createTestUser: expected DB row after insert for ${email}`,
		);
	}
	return row;
}
