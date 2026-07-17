import { Controller, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Implement, implement, ORPCError } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { PassportJwtGuard } from "../guards/passport-jwt.guard.js";
import { AuthService } from "./auth.service.js";

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.user.me)
	meRpc() {
		return implement(rpcContract.user.me).handler(({ context }) => {
			const user = context.request.user;
			if (!user?.userId) {
				throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
			}

			return {
				id: String(user.userId),
				email: user.email,
			};
		});
	}

	@Implement(rpcContract.user.signIn)
	signInRpc() {
		return implement(rpcContract.user.signIn).handler(
			async ({ input, context }) => {
				try {
					return await this.authService.signIn(input, context.response);
				} catch (err) {
					if (err instanceof UnauthorizedException) {
						throw new ORPCError("UNAUTHORIZED", { message: err.message });
					}
					throw err;
				}
			},
		);
	}

	@Implement(rpcContract.user.refresh)
	refreshRpc() {
		return implement(rpcContract.user.refresh).handler(async ({ context }) => {
			try {
				return await this.authService.refresh(
					context.request,
					context.response,
				);
			} catch (err) {
				if (err instanceof UnauthorizedException) {
					throw new ORPCError("UNAUTHORIZED", { message: err.message });
				}
				throw err;
			}
		});
	}

	@Implement(rpcContract.user.logout)
	logoutRpc() {
		return implement(rpcContract.user.logout).handler(async ({ context }) => {
			return this.authService.logout(context.request, context.response);
		});
	}

	@Implement(rpcContract.user.signUp)
	signUpRpc() {
		return implement(rpcContract.user.signUp).handler(async ({ input }) => {
			return this.authService.signUp(input);
		});
	}
}
