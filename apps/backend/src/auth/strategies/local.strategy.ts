import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import type { User } from '@repo/api/schemas'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super({ usernameField: 'email' })
	}

	async validate(email: string, password: string): Promise<User> {
		return this.authService.validateUser({ email, password })
	}
}
