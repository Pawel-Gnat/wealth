import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	Inject,
} from "@nestjs/common";
import { BaseExceptionFilter, HttpAdapterHost } from "@nestjs/core";
import { ThrottlerException } from "@nestjs/throttler";
import { ORPCError } from "@orpc/nest";
import { captureException } from "@repo/observability/node";
import type { Response } from "express";
import { tooManyRequestsBody } from "./too-many-requests";

export const shouldCaptureException = (exception: unknown): boolean => {
	if (exception instanceof HttpException) {
		return exception.getStatus() >= 500;
	}

	if (exception instanceof ORPCError) {
		return exception.status >= 500;
	}

	return true;
};

@Catch()
export class ObservabilityExceptionFilter
	extends BaseExceptionFilter
	implements ExceptionFilter
{
	constructor(@Inject(HttpAdapterHost) httpAdapterHost: HttpAdapterHost) {
		super(httpAdapterHost.httpAdapter);
	}

	override catch(exception: unknown, host: ArgumentsHost) {
		if (exception instanceof ThrottlerException) {
			const response = host.switchToHttp().getResponse<Response>();
			const retryAfter =
				response.getHeader("Retry-After") ??
				response.getHeader("Retry-After-auth");

			if (typeof retryAfter === "string" || typeof retryAfter === "number") {
				response.setHeader("Retry-After", retryAfter);
			}

			response.status(tooManyRequestsBody.status).json(tooManyRequestsBody);
			return;
		}

		if (shouldCaptureException(exception)) {
			captureException(exception);
		}
		super.catch(exception, host);
	}
}
