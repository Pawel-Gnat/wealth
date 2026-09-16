import { Inject, Injectable } from "@nestjs/common";
import type { User } from "@repo/api/types";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants.js";
import { usersTable } from "../database-service/tables/index.js";
import type { UserRow } from "../database-service/types/types.js";
import { CreateUserInput } from "./types/users.js";

@Injectable()
export class UsersService {
	constructor(@Inject(DBS.APP) private readonly db: NodePgDatabase) {}

	async findUserByEmail(email: string): Promise<UserRow | null> {
		const [user] = await this.db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, email))
			.limit(1);
		return user ?? null;
	}

	async createUser({
		email,
		passwordHash,
		firstName,
		lastName,
	}: CreateUserInput): Promise<void> {
		await this.db.insert(usersTable).values({
			email,
			password: passwordHash,
			firstName,
			lastName,
		});
	}

	async findUserById(id: string): Promise<UserRow | null> {
		const [user] = await this.db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, id))
			.limit(1);
		return user ?? null;
	}

	mapToUser(user: UserRow): User {
		return {
			id: String(user.id),
			email: user.email,
			firstName: user.firstName ?? undefined,
			lastName: user.lastName ?? undefined,
		};
	}
}
