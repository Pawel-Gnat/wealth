import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard";
import { userIdFromRequest } from "../guards/user-id-from-request";
import { AuditsService } from "./audits.service";

@Controller()
@UseGuards(SessionGuard)
export class AuditsController {
	constructor(private readonly auditsService: AuditsService) {}

	@Implement(rpcContract.audits.list)
	listAuditsRpc() {
		return implement(rpcContract.audits.list).handler(({ context, input }) => {
			return this.auditsService.list(userIdFromRequest(context.request), input);
		});
	}
}
