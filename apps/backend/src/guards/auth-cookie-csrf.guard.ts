import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import {
	AUTH_CSRF_HEADER_NAME,
	AUTH_CSRF_HEADER_VALUE,
} from "@repo/common/constants";
import type { Request } from "express";

@Injectable()
export class AuthCookieCsrfGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		const header = request.headers[AUTH_CSRF_HEADER_NAME];
		const value = Array.isArray(header) ? header[0] : header;

		if (value !== AUTH_CSRF_HEADER_VALUE) {
			throw new ForbiddenException("Missing CSRF header");
		}

		return true;
	}
}
