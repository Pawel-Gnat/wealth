import { type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AUTH_THROTTLE, AUTH_THROTTLE_ENABLED } from "./constants";

export const lacksAuthThrottle = (
	reflector: Reflector,
	context: ExecutionContext,
): boolean =>
	reflector.getAllAndOverride<boolean>(AUTH_THROTTLE_ENABLED, [
		context.getHandler(),
		context.getClass(),
	]) !== true;

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
	override async onModuleInit(): Promise<void> {
		await super.onModuleInit();

		for (const throttler of this.throttlers) {
			if (throttler.name !== AUTH_THROTTLE.name) {
				continue;
			}

			throttler.skipIf = (context) =>
				lacksAuthThrottle(this.reflector, context);
		}
	}
}
