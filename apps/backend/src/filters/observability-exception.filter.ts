import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
} from "@nestjs/common";
import { BaseExceptionFilter, type HttpAdapterHost } from "@nestjs/core";
import { captureException } from "@repo/observability/node";

@Catch()
export class ObservabilityExceptionFilter
	extends BaseExceptionFilter
	implements ExceptionFilter
{
	constructor(httpAdapterHost: HttpAdapterHost) {
		super(httpAdapterHost.httpAdapter);
	}

	override catch(exception: unknown, host: ArgumentsHost) {
		captureException(exception);
		super.catch(exception, host);
	}
}
