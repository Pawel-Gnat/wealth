import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard";
import { userIdFromRequest } from "../guards/user-id-from-request";
import { UsersService } from "./users.service";

@Controller()
@UseGuards(SessionGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Implement(rpcContract.user.search)
	searchUsersRpc() {
		return implement(rpcContract.user.search).handler(
			async ({ context, input }) => {
				return this.usersService.searchUsers(
					input.query,
					userIdFromRequest(context.request),
				);
			},
		);
	}
}
