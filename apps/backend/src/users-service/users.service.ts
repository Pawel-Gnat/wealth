import { Inject, Injectable } from "@nestjs/common";
import { USER_SEARCH_RESULT_LIMIT } from "@repo/api/schemas";
import type { User, UserSearchResponse } from "@repo/api/types";
import { and, asc, eq, ilike, isNull, ne, or } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants";
import { usersTable } from "../database-service/tables/index";
import type { UserRow } from "../database-service/types/types";
import { escapeLikePattern } from "./helpers/escape-like-pattern";
import { CreateUserInput, UpdateUserDetailsInput } from "./types/users";

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

	async updatePassword(id: string, passwordHash: string): Promise<void> {
		await this.db
			.update(usersTable)
			.set({ password: passwordHash })
			.where(eq(usersTable.id, id));
	}

	async updateDetails(
		id: string,
		{ firstName, lastName }: UpdateUserDetailsInput,
	): Promise<void> {
		await this.db
			.update(usersTable)
			.set({
				firstName: firstName || null,
				lastName: lastName || null,
			})
			.where(eq(usersTable.id, id));
	}

	async updateImage(id: string, image: string | null): Promise<void> {
		await this.db
			.update(usersTable)
			.set({ image })
			.where(eq(usersTable.id, id));
	}

	async updateImageIfCurrent(
		id: string,
		nextImage: string,
		expectedCurrent: string | null,
	): Promise<boolean> {
		const currentImageCondition =
			expectedCurrent === null
				? isNull(usersTable.image)
				: eq(usersTable.image, expectedCurrent);

		const updated = await this.db
			.update(usersTable)
			.set({ image: nextImage })
			.where(and(eq(usersTable.id, id), currentImageCondition))
			.returning({ id: usersTable.id });

		return updated.length > 0;
	}

	async searchUsers(
		query: string,
		excludeUserId: string,
	): Promise<UserSearchResponse> {
		const pattern = `%${escapeLikePattern(query)}%`;

		const rows = await this.db
			.select({
				id: usersTable.id,
				email: usersTable.email,
				firstName: usersTable.firstName,
				lastName: usersTable.lastName,
			})
			.from(usersTable)
			.where(
				and(
					ne(usersTable.id, excludeUserId),
					or(
						ilike(usersTable.email, pattern),
						ilike(usersTable.firstName, pattern),
						ilike(usersTable.lastName, pattern),
					),
				),
			)
			.orderBy(asc(usersTable.email))
			.limit(USER_SEARCH_RESULT_LIMIT + 1);

		const hasMore = rows.length > USER_SEARCH_RESULT_LIMIT;
		const limitedRows = hasMore
			? rows.slice(0, USER_SEARCH_RESULT_LIMIT)
			: rows;

		return {
			hasMore,
			data: limitedRows.map((row) => ({
				id: String(row.id),
				email: row.email,
				image: null,
				firstName: row.firstName ?? null,
				lastName: row.lastName ?? null,
			})),
		};
	}

	mapToUser(user: UserRow, imageUrl: string | null = null): User {
		return {
			id: String(user.id),
			email: user.email,
			image: imageUrl,
			firstName: user.firstName ?? null,
			lastName: user.lastName ?? null,
		};
	}
}
