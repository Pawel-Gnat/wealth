import "./instrument.js";
import { NestFactory } from "@nestjs/core";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { rpcContract } from "@repo/api/contracts";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { AppModule } from "./app.module.js";

const resolveCorsOrigin = (): boolean | string[] => {
	const corsOriginEnv = process.env.CORS_ORIGIN;
	const allowlist = (corsOriginEnv ?? "")
		.split(",")
		.map((o) => o.trim())
		.filter(Boolean);

	if (process.env.NODE_ENV === "production") {
		if (allowlist.length === 0) {
			throw new Error(
				"CORS_ORIGIN must be set to a comma-separated allowlist in production",
			);
		}
		return allowlist;
	}

	if (allowlist.length > 0) {
		return allowlist;
	}

	return true;
};

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bodyParser: false,
	});

	app.use(cookieParser());

	app.enableCors({
		origin: resolveCorsOrigin(),
		credentials: true,
		allowedHeaders: ["Authorization", "Content-Type", "X-Timezone"],
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

	const port = process.env.PORT;
	if (!port) {
		throw new Error("PORT is not set");
	}

	await app.listen(Number(port));
}
bootstrap();
