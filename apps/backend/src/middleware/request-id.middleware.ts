import { randomUUID } from "node:crypto";
import { Injectable, type NestMiddleware } from "@nestjs/common";
import { REQUEST_ID_HEADER_NAME } from "@repo/common/constants";
import { runWithContext, setRequestId } from "@repo/observability/node";
import type { NextFunction, Request, Response } from "express";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
	use(req: Request, _res: Response, next: NextFunction) {
		runWithContext(() => {
			const headerValue = req.header(REQUEST_ID_HEADER_NAME);
			const requestId =
				typeof headerValue === "string" && headerValue.trim() !== ""
					? headerValue.trim()
					: randomUUID();

			setRequestId(requestId);
			next();
		});
	}
}
