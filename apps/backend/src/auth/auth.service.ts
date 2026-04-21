import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import type { SignInPayload, User } from "@repo/api/schemas";
import type { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(payload: SignInPayload): Promise<User> {
		const user = await this.usersService.findUserByEmail(payload.email);
		if (!user || user.password !== payload.password) {
			throw new UnauthorizedException("Invalid credentials");
		}
		return {
			id: String(user.id),
			email: user.email,
		};
	}

	async signIn(user: User): Promise<string> {
		const payload = { email: user.email, sub: user.id };
		return this.jwtService.signAsync(payload);
	}
}
