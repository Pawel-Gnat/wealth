import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { SignInPayload, SignInResponse, User } from "@repo/api/schemas";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService, private jwtService: JwtService) {}

	async authenticate(payload: SignInPayload): Promise<SignInResponse> {
		const user = await this.validateUser(payload);
		const token = await this.signIn(user);
		
		return {
			data: {
				token,
			},
		};
	}

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
