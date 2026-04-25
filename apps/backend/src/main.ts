import { NestFactory } from "@nestjs/core";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { rpcContract } from "@repo/api/contracts";
import swaggerUi from "swagger-ui-express";
import { AppModule } from "./app.module.js";

const corsOriginEnv = process.env.CORS_ORIGIN;
const corsOrigin =
	corsOriginEnv === undefined || corsOriginEnv === ""
		? true
		: corsOriginEnv
				.split(",")
				.map((o) => o.trim())
				.filter(Boolean);

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bodyParser: false,
	});

	app.enableCors({
		origin: corsOrigin,
		credentials: true,
	});

	const generator = new OpenAPIGenerator({
		schemaConverters: [new ZodToJsonSchemaConverter()],
	});
	const spec = await generator.generate(rpcContract, {
		info: {
			title: "Wealth API",
			version: "1.0.0",
		},
	});

	const expressApp = app.getHttpAdapter().getInstance();
	expressApp.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));

	await app.listen(Number(process.env.PORT) || 3000);
}
bootstrap();
