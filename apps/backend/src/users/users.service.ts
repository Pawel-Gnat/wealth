import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "src/database/constants";
import { usersTable } from "src/database/tables";
import type { UserRow } from "src/database/types/types";

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
}
