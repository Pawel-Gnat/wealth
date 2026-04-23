import { Module } from '@nestjs/common'
import { ORPCModule, onError } from '@orpc/nest'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './database/database.module'
import { UsersModule } from './users/users.module'
import { AuthController } from './auth/auth.controller'
import type { Request } from 'express'
import { REQUEST } from '@nestjs/core'

declare module '@orpc/nest' {
	interface ORPCGlobalConfig {
		request: Request
	}
}

@Module({
	imports: [
		ORPCModule.forRootAsync({
			useFactory: (request: Request) => ({
				context: { request },
				interceptors: [
					onError((error: unknown) => {
						console.error('[oRPC]', error)
					}),
				],
			}),
			inject: [REQUEST],
		}),
		UsersModule,
		AuthModule,
		DatabaseModule,
	],
	controllers: [AuthController],
})
export class AppModule {}
