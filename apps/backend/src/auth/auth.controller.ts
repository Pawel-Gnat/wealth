import { Controller, Get, HttpCode, HttpStatus, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common'
import { Implement, implement, ORPCError } from '@orpc/nest'
import { rpcContract } from '@repo/api/contracts'
import type { User } from '@repo/api/schemas'
import type { Request as ExpressRequest } from 'express'
import { AuthService } from './auth.service'
import { PassportJwtGuard } from './guards/passport-jwt.guard'
import { PassportLocalGuard } from './guards/passport-local.guard'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('me')
	@UseGuards(PassportJwtGuard)
	async getMe(
		@Request()
		request: ExpressRequest & {
			user: { userId: string; email: string }
		},
	) {
		return request.user
	}

	@HttpCode(HttpStatus.OK)
	@Post('signin')
	@UseGuards(PassportLocalGuard)
	async signin(@Request() request: ExpressRequest & { user: User }) {
		return this.authService.signInForVerifiedUser(request.user)
	}

	@Implement(rpcContract.user.signIn)
	signInRpc() {
		return implement(rpcContract.user.signIn).handler(async ({ input, context }) => {
			console.log(context)
			try {
				return await this.authService.signIn(input)
			} catch (err) {
				if (err instanceof UnauthorizedException) {
					throw new ORPCError('UNAUTHORIZED', { message: err.message })
				}
				throw err
			}
		})
	}

	@Implement(rpcContract.user.signUp)
	signUpRpc() {
		return implement(rpcContract.user.signUp).handler(async ({ input, context }) => {
			console.log(context)
			return this.authService.signUp(input)
		})
	}
}
