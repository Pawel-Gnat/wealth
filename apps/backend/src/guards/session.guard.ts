import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { setUserId } from "@repo/observability/node";
import type { Request } from "express";
import type { AuthService } from "../auth-service/auth.service.js";

@Injectable()
export class SessionGuard implements CanActivate {
	constructor(private readonly authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const session = await this.authService.resolveRpcSession(request);
		if (!session) {
			throw new UnauthorizedException("Unauthorized");
		}

		setUserId(session.userId);
		request.user = {
			userId: session.userId,
			email: session.email,
		};

		return true;
	}
}
