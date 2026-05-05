import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ORPCError } from "@orpc/server";
import type {
	SignInPayload,
	SignInResponse,
	SignUpPayload,
	SignUpResponse,
	User,
} from "@repo/api/schemas";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users-service/users.service.js";

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
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

	async signIn(payload: SignInPayload): Promise<SignInResponse> {
		const user = await this.validateUser(payload);
		return this.signInForVerifiedUser(user);
	}

	async signInForVerifiedUser(user: User): Promise<SignInResponse> {
		const token = await this.jwtService.signAsync({
			email: user.email,
			sub: user.id,
		});
		return { data: { token } };
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
}
