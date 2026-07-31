import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	Inject,
} from "@nestjs/common";
import { BaseExceptionFilter, HttpAdapterHost } from "@nestjs/core";
import { ORPCError } from "@orpc/nest";
import { captureException } from "@repo/observability/node";

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
		if (shouldCaptureException(exception)) {
			captureException(exception);
		}
		super.catch(exception, host);
	}
}
