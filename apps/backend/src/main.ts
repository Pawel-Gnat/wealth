import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const corsOriginEnv = process.env['CORS_ORIGIN']
const corsOrigin =
	corsOriginEnv === undefined || corsOriginEnv === ''
		? true
		: corsOriginEnv
				.split(',')
				.map(o => o.trim())
				.filter(Boolean)

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.enableCors({
		origin: corsOrigin,
		credentials: true,
	})

	await app.listen(Number(process.env.PORT) || 3000)
}
bootstrap()
