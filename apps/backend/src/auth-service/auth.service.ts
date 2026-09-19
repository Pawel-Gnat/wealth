import { createHash, randomBytes } from "node:crypto";
import {
	Inject,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from "@nestjs/common";
import { ORPCError } from "@orpc/server";
import {
	USER_CREATED_MESSAGE,
	USER_DETAILS_UPDATED_MESSAGE,
	USER_PASSWORD_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import type {
	CreateUserPayload,
	CreateUserResponse,
	SessionSnapshotResponse,
	SignInPayload,
	User,
	UserEditDetailsPayload,
	UserEditDetailsResponse,
	UserEditPasswordPayload,
	UserEditPasswordResponse,
} from "@repo/api/types";
import {
	REFRESH_COOKIE_NAME,
	REFRESH_GRACE_MS,
	REFRESH_TTL_DAYS,
	SESSION_COOKIE_NAME,
	SESSION_TTL,
} from "@repo/common/constants";
import { AUTH_OBSERVABILITY_EVENTS } from "@repo/observability/node";
import * as bcrypt from "bcrypt";
import { addDays } from "date-fns";
import { and, eq, gt, ne } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Request, Response } from "express";
import { DBS } from "../database-service/constants.js";
import { sessionsTable } from "../database-service/tables/index.js";
import { isProduction } from "../shared/http/is-production.js";
import { logAuthEvent } from "../shared/observability/log-event.js";
import { SsePublisher } from "../sse-service/sse-publisher.service.js";
import { UsersService } from "../users-service/users.service.js";
import {
	clearAuthCookies,
	readAuthCookie,
	setAuthCookies,
} from "./auth-cookies.js";

const BCRYPT_ROUNDS = 10;

export type RpcSession = {
	userId: string;
	sessionId: string;
	sessionExpiresAt: Date;
};

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		@Inject(DBS.APP) private readonly db: NodePgDatabase,
		private readonly ssePublisher: SsePublisher,
	) {}

	async validateUser(payload: SignInPayload): Promise<User> {
		const user = await this.usersService.findUserByEmail(payload.email);
		if (!user) {
			throw new UnauthorizedException("Invalid credentials");
		}
		const passwordOk = await bcrypt.compare(payload.password, user.password);
		if (!passwordOk) {
			throw new UnauthorizedException("Invalid credentials");
		}
		return this.usersService.mapToUser(user);
	}

	async signIn(
		payload: SignInPayload,
		request: Request,
		response: Response,
	): Promise<SessionSnapshotResponse> {
		const user = await this.validateUser(payload);
		await this.replaceSessionFromRefreshCookie(request);
		const tokens = await this.insertSession(user.id);
		setAuthCookies(response, tokens, isProduction());
		logAuthEvent(AUTH_OBSERVABILITY_EVENTS.signInSucceeded);
		return this.toSnapshot(user, tokens.sessionExpiresAt);
	}

	async refresh(
		request: Request,
		response: Response,
	): Promise<SessionSnapshotResponse> {
		const refreshToken = readAuthCookie(request, REFRESH_COOKIE_NAME);
		if (!refreshToken) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		const presentedHash = this.hashToken(refreshToken);
		const now = new Date();
		const nextSessionToken = this.generateToken();
		const nextRefreshToken = this.generateToken();
		const sessionExpiresAt = new Date(now.getTime() + SESSION_TTL);
		const refreshExpiresAt = addDays(now, REFRESH_TTL_DAYS);

		const [rotated] = await this.db
			.update(sessionsTable)
			.set({
				sessionHash: this.hashToken(nextSessionToken),
				refreshHash: this.hashToken(nextRefreshToken),
				previousRefreshHash: presentedHash,
				previousRefreshValidUntil: new Date(now.getTime() + REFRESH_GRACE_MS),
				sessionExpiresAt,
				refreshExpiresAt,
			})
			.where(
				and(
					eq(sessionsTable.refreshHash, presentedHash),
					gt(sessionsTable.refreshExpiresAt, now),
				),
			)
			.returning();

		if (rotated) {
			const user = await this.requireUser(rotated.userId);
			setAuthCookies(
				response,
				{
					sessionToken: nextSessionToken,
					refreshToken: nextRefreshToken,
					sessionExpiresAt,
					refreshExpiresAt,
				},
				isProduction(),
			);
			logAuthEvent(AUTH_OBSERVABILITY_EVENTS.refreshSucceeded);
			return this.toSnapshot(user, sessionExpiresAt);
		}

		const [graceRow] = await this.db
			.select()
			.from(sessionsTable)
			.where(
				and(
					eq(sessionsTable.previousRefreshHash, presentedHash),
					gt(sessionsTable.previousRefreshValidUntil, now),
				),
			)
			.limit(1);

		if (graceRow) {
			const user = await this.requireUser(graceRow.userId);
			logAuthEvent(AUTH_OBSERVABILITY_EVENTS.refreshSucceeded);
			return this.toSnapshot(user, graceRow.sessionExpiresAt);
		}

		const [reused] = await this.db
			.select({
				id: sessionsTable.id,
				userId: sessionsTable.userId,
			})
			.from(sessionsTable)
			.where(eq(sessionsTable.previousRefreshHash, presentedHash))
			.limit(1);

		if (reused) {
			await this.endSession(reused.userId, reused.id);
		}

		throw new UnauthorizedException("Invalid refresh token");
	}

	async logout(request: Request, response: Response): Promise<void> {
		const refreshToken = readAuthCookie(request, REFRESH_COOKIE_NAME);
		if (refreshToken) {
			const tokenHash = this.hashToken(refreshToken);
			const [row] = await this.db
				.select({
					id: sessionsTable.id,
					userId: sessionsTable.userId,
				})
				.from(sessionsTable)
				.where(eq(sessionsTable.refreshHash, tokenHash))
				.limit(1);

			if (row) {
				await this.endSession(row.userId, row.id);
			}
		}

		clearAuthCookies(response, isProduction());
		logAuthEvent(AUTH_OBSERVABILITY_EVENTS.logoutSucceeded);
	}

	async me(request: Request): Promise<SessionSnapshotResponse> {
		const session = request.user;
		if (!session?.userId || !session.sessionExpiresAt) {
			throw new UnauthorizedException("Unauthorized");
		}

		const user = await this.usersService.findUserById(session.userId);
		if (!user) {
			throw new UnauthorizedException("Unauthorized");
		}

		return this.toSnapshot(
			this.usersService.mapToUser(user),
			session.sessionExpiresAt,
		);
	}

	async resolveRpcSession(request: Request): Promise<RpcSession | null> {
		const sessionToken = readAuthCookie(request, SESSION_COOKIE_NAME);
		if (!sessionToken) {
			return null;
		}

		return this.resolveSessionByHash(
			this.hashToken(sessionToken),
			"sessionHash",
		);
	}

	async resolveActiveRefreshSession(request: Request): Promise<{
		userId: string;
		sessionId: string;
	} | null> {
		const refreshToken = readAuthCookie(request, REFRESH_COOKIE_NAME);
		if (!refreshToken) {
			return null;
		}

		const session = await this.resolveSessionByHash(
			this.hashToken(refreshToken),
			"refreshHash",
		);
		if (!session) {
			return null;
		}

		return {
			userId: session.userId,
			sessionId: session.sessionId,
		};
	}

	async updatePassword(
		input: UserEditPasswordPayload,
		request: Request,
	): Promise<UserEditPasswordResponse> {
		const session = request.user;
		if (!session?.userId || !session.sessionId) {
			throw new UnauthorizedException("Unauthorized");
		}

		const user = await this.usersService.findUserById(session.userId);
		if (!user) {
			throw new UnauthorizedException("Unauthorized");
		}

		const currentOk = await bcrypt.compare(
			input.currentPassword,
			user.password,
		);
		if (!currentOk) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
		await this.usersService.updatePassword(user.id, passwordHash);
		await this.endOtherSessions(user.id, session.sessionId);
		logAuthEvent(AUTH_OBSERVABILITY_EVENTS.passwordUpdateSucceeded);

		return { data: { message: USER_PASSWORD_UPDATED_MESSAGE } };
	}

	async updateDetails(
		input: UserEditDetailsPayload,
		request: Request,
	): Promise<UserEditDetailsResponse> {
		const session = request.user;
		if (!session?.userId) {
			throw new UnauthorizedException("Unauthorized");
		}

		const user = await this.usersService.findUserById(session.userId);
		if (!user) {
			throw new UnauthorizedException("Unauthorized");
		}

		await this.usersService.updateDetails(user.id, {
			firstName: input.firstName,
			lastName: input.lastName,
		});
		logAuthEvent(AUTH_OBSERVABILITY_EVENTS.detailsUpdateSucceeded);

		return { data: { message: USER_DETAILS_UPDATED_MESSAGE } };
	}

	async signUp(input: CreateUserPayload): Promise<CreateUserResponse> {
		const existing = await this.usersService.findUserByEmail(input.email);
		if (existing) {
			throw new ORPCError("CONFLICT", { message: "Email already registered" });
		}
		const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
		await this.usersService.createUser({
			email: input.email,
			passwordHash,
			firstName: input.firstName ?? undefined,
			lastName: input.lastName ?? undefined,
		});
		logAuthEvent(AUTH_OBSERVABILITY_EVENTS.signUpSucceeded);
		return { data: { message: USER_CREATED_MESSAGE } };
	}

	private async replaceSessionFromRefreshCookie(
		request: Request,
	): Promise<void> {
		const refreshToken = readAuthCookie(request, REFRESH_COOKIE_NAME);
		if (!refreshToken) {
			return;
		}

		const tokenHash = this.hashToken(refreshToken);
		const [row] = await this.db
			.select({
				id: sessionsTable.id,
				userId: sessionsTable.userId,
			})
			.from(sessionsTable)
			.where(eq(sessionsTable.refreshHash, tokenHash))
			.limit(1);

		if (!row) {
			return;
		}

		await this.endSession(row.userId, row.id);
	}

	private async insertSession(userId: string): Promise<{
		sessionToken: string;
		refreshToken: string;
		sessionExpiresAt: Date;
		refreshExpiresAt: Date;
		sessionId: string;
	}> {
		const sessionToken = this.generateToken();
		const refreshToken = this.generateToken();
		const now = new Date();
		const sessionExpiresAt = new Date(now.getTime() + SESSION_TTL);
		const refreshExpiresAt = addDays(now, REFRESH_TTL_DAYS);

		const [row] = await this.db
			.insert(sessionsTable)
			.values({
				userId,
				sessionHash: this.hashToken(sessionToken),
				refreshHash: this.hashToken(refreshToken),
				sessionExpiresAt,
				refreshExpiresAt,
			})
			.returning({ id: sessionsTable.id });

		if (!row) {
			throw new InternalServerErrorException("Failed to create session");
		}

		return {
			sessionToken,
			refreshToken,
			sessionExpiresAt,
			refreshExpiresAt,
			sessionId: row.id,
		};
	}

	private async resolveSessionByHash(
		tokenHash: string,
		column: "sessionHash" | "refreshHash",
	): Promise<RpcSession | null> {
		const now = new Date();
		const expiryColumn =
			column === "sessionHash"
				? sessionsTable.sessionExpiresAt
				: sessionsTable.refreshExpiresAt;

		const [row] = await this.db
			.select({
				id: sessionsTable.id,
				userId: sessionsTable.userId,
				sessionExpiresAt: sessionsTable.sessionExpiresAt,
			})
			.from(sessionsTable)
			.where(and(eq(sessionsTable[column], tokenHash), gt(expiryColumn, now)))
			.limit(1);

		if (!row) {
			return null;
		}

		return {
			userId: row.userId,
			sessionId: row.id,
			sessionExpiresAt: row.sessionExpiresAt,
		};
	}

	private async requireUser(userId: string): Promise<User> {
		const user = await this.usersService.findUserById(userId);
		if (!user) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		return this.usersService.mapToUser(user);
	}

	private async endOtherSessions(
		userId: string,
		currentSessionId: string,
	): Promise<void> {
		const rows = await this.db
			.select({ id: sessionsTable.id })
			.from(sessionsTable)
			.where(
				and(
					eq(sessionsTable.userId, userId),
					ne(sessionsTable.id, currentSessionId),
				),
			);

		await Promise.all(rows.map((row) => this.endSession(userId, row.id)));
	}

	private async endSession(userId: string, sessionId: string): Promise<void> {
		await this.publishSessionEndedBestEffort({ userId, targetId: sessionId });
		await this.db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
	}

	private toSnapshot(
		user: User,
		sessionExpiresAt: Date,
	): SessionSnapshotResponse {
		return {
			data: {
				user,
				sessionExpiresAt: sessionExpiresAt.toISOString(),
			},
		};
	}

	private generateToken() {
		return randomBytes(32).toString("base64url");
	}

	private hashToken(token: string) {
		return createHash("sha256").update(token).digest("hex");
	}

	private async publishSessionEndedBestEffort(input: {
		userId: string;
		targetId: string;
	}) {
		try {
			await this.ssePublisher.publishSessionEnded(input);
		} catch {
			logAuthEvent(AUTH_OBSERVABILITY_EVENTS.sessionEndedPublishFailed, "warn");
		}
	}
}
