import { createHash, randomBytes } from "node:crypto";
import {
	forwardRef,
	Inject,
	Injectable,
	Logger,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ORPCError } from "@orpc/server";
import type {
	LogoutResponse,
	SignInPayload,
	SignInResponse,
	SignUpPayload,
	SignUpResponse,
	TokenResponse,
	User,
} from "@repo/api/schemas";
import {
	REFRESH_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_PATH,
	REFRESH_TOKEN_EXPIRES_IN_DAYS,
} from "@repo/common/constants";
import * as bcrypt from "bcrypt";
import { addDays } from "date-fns";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Request, Response } from "express";
import { ulid } from "ulid";
import { DBS } from "../database-service/constants.js";
import { refreshTokensTable } from "../database-service/tables/index.js";
import { SsePublisher } from "../sse-service/sse-publisher.service.js";
import { UsersService } from "../users-service/users.service.js";

const BCRYPT_ROUNDS = 10;

type RefreshTokensDb = Pick<NodePgDatabase, "delete">;

type AuthSessionResult = {
	accessToken: string;
	refreshToken: string;
	refreshExpiresAt: Date;
	sessionId: string;
};

export type SessionRevocationCapture = {
	userId: string;
	sessionId: string;
};

export class RefreshTokenReuseError extends UnauthorizedException {
	readonly userId: string;
	readonly sessionId: string;

	constructor(capture: SessionRevocationCapture) {
		super("Invalid refresh token");
		this.userId = capture.userId;
		this.sessionId = capture.sessionId;
	}
}

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private configService: ConfigService,
		@Inject(DBS.APP) private readonly db: NodePgDatabase,
		@Inject(forwardRef(() => SsePublisher))
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
		return {
			id: String(user.id),
			email: user.email,
		};
	}

	async signIn(
		payload: SignInPayload,
		response: Response,
	): Promise<SignInResponse> {
		const session = await this.createSignInSession(payload);
		this.setRefreshTokenCookie(
			response,
			session.refreshToken,
			session.refreshExpiresAt,
		);

		return { data: { token: session.accessToken } };
	}

	async refresh(request: Request, response: Response): Promise<TokenResponse> {
		const refreshToken = this.readRefreshTokenFromRequest(request);
		if (!refreshToken) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		const session = await this.refreshSession(refreshToken);
		this.setRefreshTokenCookie(
			response,
			session.refreshToken,
			session.refreshExpiresAt,
		);

		return { data: { token: session.accessToken } };
	}

	async logout(request: Request, response: Response): Promise<LogoutResponse> {
		const refreshToken = this.readRefreshTokenFromRequest(request);
		const capture = await this.logoutSession(refreshToken);

		if (capture) {
			await this.publishSessionRevokedBestEffort({
				userId: capture.userId,
				scope: "session",
				targetId: capture.sessionId,
			});
		}

		this.clearRefreshTokenCookie(response);

		return { data: { message: "logged_out" } };
	}

	async createSession(user: User): Promise<AuthSessionResult> {
		const accessToken = await this.createAccessToken(user);
		const refreshToken = this.generateRefreshToken();
		const refreshExpiresAt = this.getRefreshTokenExpiresAt();
		const sessionId = ulid();
		const now = new Date();

		await this.db.transaction(async (tx) => {
			await tx.insert(refreshTokensTable).values({
				userId: user.id,
				sessionId,
				tokenHash: this.hashRefreshToken(refreshToken),
				expiresAt: refreshExpiresAt,
			});
			await this.cleanupStaleRefreshTokens(tx, user.id, now);
		});

		return {
			accessToken,
			refreshToken,
			refreshExpiresAt,
			sessionId,
		};
	}

	async refreshSession(refreshToken: string): Promise<AuthSessionResult> {
		const tokenHash = this.hashRefreshToken(refreshToken);
		const now = new Date();

		const result = await this.db.transaction(async (tx) => {
			const [storedToken] = await tx
				.update(refreshTokensTable)
				.set({ revokedAt: now })
				.where(
					and(
						eq(refreshTokensTable.tokenHash, tokenHash),
						isNull(refreshTokensTable.revokedAt),
						gt(refreshTokensTable.expiresAt, now),
					),
				)
				.returning();

			if (!storedToken) {
				const [existing] = await tx
					.select({
						userId: refreshTokensTable.userId,
						sessionId: refreshTokensTable.sessionId,
						revokedAt: refreshTokensTable.revokedAt,
					})
					.from(refreshTokensTable)
					.where(eq(refreshTokensTable.tokenHash, tokenHash))
					.limit(1);

				if (existing?.revokedAt != null) {
					await tx
						.update(refreshTokensTable)
						.set({ revokedAt: now })
						.where(
							and(
								eq(refreshTokensTable.userId, existing.userId),
								isNull(refreshTokensTable.revokedAt),
							),
						);

					return {
						ok: false as const,
						reuseRevocation: {
							userId: existing.userId,
							sessionId: existing.sessionId,
						} satisfies SessionRevocationCapture,
					};
				}

				return { ok: false as const };
			}

			const user = await this.usersService.findUserById(storedToken.userId);
			if (!user) {
				return { ok: false as const };
			}

			const accessToken = await this.createAccessToken({
				id: String(user.id),
				email: user.email,
			});
			const nextRefreshToken = this.generateRefreshToken();
			const refreshExpiresAt = this.getRefreshTokenExpiresAt();
			const userId = String(user.id);
			const sessionId = storedToken.sessionId;

			await tx.insert(refreshTokensTable).values({
				userId,
				sessionId,
				tokenHash: this.hashRefreshToken(nextRefreshToken),
				expiresAt: refreshExpiresAt,
			});
			await this.cleanupStaleRefreshTokens(tx, userId, now);

			return {
				ok: true as const,
				session: {
					accessToken,
					refreshToken: nextRefreshToken,
					refreshExpiresAt,
					sessionId,
				},
			};
		});

		if (!result.ok) {
			if (result.reuseRevocation) {
				throw new RefreshTokenReuseError(result.reuseRevocation);
			}
			throw new UnauthorizedException("Invalid refresh token");
		}

		return result.session;
	}

	async logoutSession(
		refreshToken: string | null,
	): Promise<SessionRevocationCapture | null> {
		if (!refreshToken) {
			return null;
		}

		const tokenHash = this.hashRefreshToken(refreshToken);

		const [revoked] = await this.db
			.update(refreshTokensTable)
			.set({ revokedAt: new Date() })
			.where(
				and(
					eq(refreshTokensTable.tokenHash, tokenHash),
					isNull(refreshTokensTable.revokedAt),
				),
			)
			.returning({
				userId: refreshTokensTable.userId,
				sessionId: refreshTokensTable.sessionId,
			});

		if (!revoked) {
			return null;
		}

		return {
			userId: revoked.userId,
			sessionId: revoked.sessionId,
		};
	}

	async resolveActiveRefreshSession(
		request: Request,
	): Promise<SessionRevocationCapture | null> {
		const refreshToken = this.readRefreshTokenFromRequest(request);
		if (!refreshToken) {
			return null;
		}

		const tokenHash = this.hashRefreshToken(refreshToken);
		const now = new Date();

		const [row] = await this.db
			.select({
				userId: refreshTokensTable.userId,
				sessionId: refreshTokensTable.sessionId,
			})
			.from(refreshTokensTable)
			.where(
				and(
					eq(refreshTokensTable.tokenHash, tokenHash),
					isNull(refreshTokensTable.revokedAt),
					gt(refreshTokensTable.expiresAt, now),
				),
			)
			.limit(1);

		return row ?? null;
	}

	private async cleanupStaleRefreshTokens(
		db: RefreshTokensDb,
		userId: string,
		now: Date,
	): Promise<void> {
		await db
			.delete(refreshTokensTable)
			.where(
				and(
					eq(refreshTokensTable.userId, userId),
					lt(refreshTokensTable.expiresAt, now),
				),
			);
	}

	private generateRefreshToken() {
		return randomBytes(32).toString("base64url");
	}

	private hashRefreshToken(token: string) {
		return createHash("sha256").update(token).digest("hex");
	}

	async createAccessToken(user: User): Promise<string> {
		return this.jwtService.signAsync({
			email: user.email,
			sub: user.id,
		});
	}

	async signUp(input: SignUpPayload): Promise<SignUpResponse> {
		const existing = await this.usersService.findUserByEmail(input.email);
		if (existing) {
			throw new ORPCError("CONFLICT", { message: "Email already registered" });
		}
		const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
		await this.usersService.createUser(input.email, passwordHash);
		return { data: { message: "user_created" } };
	}

	private async createSignInSession(
		payload: SignInPayload,
	): Promise<AuthSessionResult> {
		const user = await this.validateUser(payload);
		return this.createSession(user);
	}

	private readRefreshTokenFromRequest(request: Request): string | null {
		const token = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
		if (typeof token !== "string" || token.length === 0) {
			return null;
		}

		return token;
	}

	private setRefreshTokenCookie(
		response: Response,
		token: string,
		expiresAt: Date,
	): void {
		response.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
			httpOnly: true,
			secure: this.isSecureCookie(),
			sameSite: "lax",
			path: REFRESH_TOKEN_COOKIE_PATH,
			expires: expiresAt,
		});
	}

	private clearRefreshTokenCookie(response: Response): void {
		response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
			httpOnly: true,
			secure: this.isSecureCookie(),
			sameSite: "lax",
			path: REFRESH_TOKEN_COOKIE_PATH,
		});
	}

	private isSecureCookie(): boolean {
		return this.configService.get<string>("NODE_ENV") === "production";
	}

	private getRefreshTokenExpiresAt(): Date {
		return addDays(new Date(), REFRESH_TOKEN_EXPIRES_IN_DAYS);
	}

	private async publishSessionRevokedBestEffort(input: {
		userId: string;
		scope: "session" | "user";
		targetId: string;
	}) {
		try {
			await this.ssePublisher.publishAuthSessionRevoked(input);
		} catch (error) {
			this.logger.warn(
				`Failed to publish auth.session-revoked: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}
}
