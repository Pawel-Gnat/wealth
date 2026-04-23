import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database/constants.js";
import { usersTable } from "../database/tables/index.js";
import type { UserRow } from "../database/types/types.js";

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

	async createUser(email: string, passwordHash: string): Promise<void> {
		await this.db.insert(usersTable).values({
			email,
			password: passwordHash,
		});
	}
}
