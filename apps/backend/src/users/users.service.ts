import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { db } from "src/database/db";
import { usersTable } from "src/database/schema";
import type { UserRow } from "src/database/types";

@Injectable()
export class UsersService {
	async findUserByEmail(email: string): Promise<UserRow | null> {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, email))
			.limit(1);
		return user ?? null;
	}
}
