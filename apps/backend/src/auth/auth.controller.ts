import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import type { SignInPayload } from "@repo/api/schemas";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(AuthGuard)
	@Get('me')
	async getMe(@Req() request: Request) {
		return request.user;
	}

	@HttpCode(HttpStatus.OK)
	@Post("signin")
	async signin(@Body() signInPayload: SignInPayload) {
		return this.authService.authenticate(signInPayload);
	}
}
