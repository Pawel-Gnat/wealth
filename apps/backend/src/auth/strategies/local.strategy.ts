import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { SignInPayload, User } from "@repo/api/schemas";
import { Strategy } from "passport-local";
import type { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: "email",
			passwordField: "password",
		});
	}

	async validate(payload: SignInPayload): Promise<User> {
		return this.authService.validateUser(payload);
	}
}
