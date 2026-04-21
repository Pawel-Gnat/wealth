import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import type { User } from "@repo/api/schemas";
import type { Request as ExpressRequest } from "express";
import type { AuthService } from "./auth.service";
import { PassportJwtGuard } from "./guards/passport-jwt.guard";
import { PassportLocalGuard } from "./guards/passport-local.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get("me")
	@UseGuards(PassportJwtGuard)
	async getMe(
		@Request() request: ExpressRequest & {
			user: { userId: string; email: string };
		},
	) {
		return request.user;
	}

	@HttpCode(HttpStatus.OK)
	@Post("signin")
	@UseGuards(PassportLocalGuard)
	async signin(@Request() request: ExpressRequest & { user: User }) {
		return this.authService.signIn(request.user);
	}
}
