import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
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
import { and, eq, gt, isNull } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Request, Response } from "express";
import { DBS } from "../database-service/constants.js";
import { refreshTokensTable } from "../database-service/tables/index.js";
import { UsersService } from "../users-service/users.service.js";

const BCRYPT_ROUNDS = 10;

type AuthSessionResult = {
	accessToken: string;
	refreshToken: string;
	refreshExpiresAt: Date;
};

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private configService: ConfigService,
		@Inject(DBS.APP) private readonly db: NodePgDatabase,
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
		await this.logoutSession(refreshToken);
		this.clearRefreshTokenCookie(response);

		return { data: { message: "logged_out" } };
	}

	async createSession(user: User): Promise<AuthSessionResult> {
		const accessToken = await this.createAccessToken(user);
		const refreshToken = this.generateRefreshToken();
		const refreshExpiresAt = this.getRefreshTokenExpiresAt();

		await this.db.insert(refreshTokensTable).values({
			userId: user.id,
			tokenHash: this.hashRefreshToken(refreshToken),
			expiresAt: refreshExpiresAt,
		});

		return {
			accessToken,
			refreshToken,
			refreshExpiresAt,
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

			await tx.insert(refreshTokensTable).values({
				userId: String(user.id),
				tokenHash: this.hashRefreshToken(nextRefreshToken),
				expiresAt: refreshExpiresAt,
			});

			return {
				ok: true as const,
				session: {
					accessToken,
					refreshToken: nextRefreshToken,
					refreshExpiresAt,
				},
			};
		});

		if (!result.ok) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		return result.session;
	}

	async logoutSession(refreshToken: string | null): Promise<void> {
		if (!refreshToken) {
			return;
		}

		const tokenHash = this.hashRefreshToken(refreshToken);

		await this.db
			.update(refreshTokensTable)
			.set({ revokedAt: new Date() })
			.where(
				and(
					eq(refreshTokensTable.tokenHash, tokenHash),
					isNull(refreshTokensTable.revokedAt),
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
}
