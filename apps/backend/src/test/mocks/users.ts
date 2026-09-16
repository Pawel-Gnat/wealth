import type { UserRow } from "../../database-service/types/types.js";
import type { CreateUserInput } from "../../users-service/types/users.js";
import type { UsersService } from "../../users-service/users.service.js";

export function uniqueTestUserEmail(emailTag: string): string {
	return `${emailTag}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@example.com`;
}

type CreateTestUserOptions = Omit<CreateUserInput, "email"> & {
	email?: CreateUserInput["email"];
	emailTag?: string;
};

export async function createTestUser(
	usersService: UsersService,
	options: CreateTestUserOptions,
): Promise<UserRow> {
	const { email: emailOption, emailTag, ...input } = options;
	const email = emailOption ?? uniqueTestUserEmail(emailTag ?? "fixture");
	await usersService.createUser({ ...input, email });
	const row = await usersService.findUserByEmail(email);
	if (!row) {
		throw new Error(
			`createTestUser: expected DB row after insert for ${email}`,
		);
	}
	return row;
}
