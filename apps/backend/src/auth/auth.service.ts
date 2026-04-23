import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ORPCError } from '@orpc/server'
import type { SignInPayload, SignInResponse, SignUpPayload, SignUpResponse, User } from '@repo/api/schemas'
import * as bcrypt from 'bcrypt'
import { UsersService } from 'src/users/users.service'

const BCRYPT_ROUNDS = 10

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(payload: SignInPayload): Promise<User> {
		const user = await this.usersService.findUserByEmail(payload.email)
		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}
		const passwordOk = await bcrypt.compare(payload.password, user.password)
		if (!passwordOk) {
			throw new UnauthorizedException('Invalid credentials')
		}
		return {
			id: String(user.id),
			email: user.email,
		}
	}

	async signIn(user: User): Promise<string> {
		const payload = { email: user.email, sub: user.id }
		return this.jwtService.signAsync(payload)
	}

	async rpcSignIn(input: SignInPayload): Promise<SignInResponse> {
		const user = await this.usersService.findUserByEmail(input.email)
		if (!user) {
			throw new ORPCError('UNAUTHORIZED', { message: 'Invalid credentials' })
		}
		const passwordOk = await bcrypt.compare(input.password, user.password)
		if (!passwordOk) {
			throw new ORPCError('UNAUTHORIZED', { message: 'Invalid credentials' })
		}
		const token = await this.signIn({
			id: String(user.id),
			email: user.email,
		})
		return { data: { token } }
	}

	async rpcSignUp(input: SignUpPayload): Promise<SignUpResponse> {
		const existing = await this.usersService.findUserByEmail(input.email)
		if (existing) {
			throw new ORPCError('CONFLICT', { message: 'Email already registered' })
		}
		const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
		await this.usersService.createUser(input.email, passwordHash)
		return { data: { message: 'user_created' } }
	}
}
