import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard";
import { userIdFromRequest } from "../guards/user-id-from-request";
import { RecordsService } from "./records.service";

@Controller()
@UseGuards(SessionGuard)
export class RecordsController {
	constructor(private readonly recordsService: RecordsService) {}

	@Implement(rpcContract.records.list)
	listRecordsRpc() {
		return implement(rpcContract.records.list).handler(({ context, input }) => {
			return this.recordsService.listByUserId(
				userIdFromRequest(context.request),
				input.kind,
				input.budgetId,
			);
		});
	}

	@Implement(rpcContract.records.create)
	createRecordRpc() {
		return implement(rpcContract.records.create).handler(
			({ context, input }) => {
				return this.recordsService.createByUserId(
					userIdFromRequest(context.request),
					input.kind,
					{ date: input.date, lineItems: input.lineItems },
				);
			},
		);
	}

	@Implement(rpcContract.records.get)
	getRecordRpc() {
		return implement(rpcContract.records.get).handler(({ context, input }) => {
			return this.recordsService.getByUserId(
				userIdFromRequest(context.request),
				input.id,
			);
		});
	}

	@Implement(rpcContract.records.update)
	updateRecordRpc() {
		return implement(rpcContract.records.update).handler(
			({ context, input }) => {
				return this.recordsService.updateByUserId(
					userIdFromRequest(context.request),
					input.id,
					input.kind,
					{ date: input.date, lineItems: input.lineItems },
				);
			},
		);
	}

	@Implement(rpcContract.records.delete)
	deleteRecordRpc() {
		return implement(rpcContract.records.delete).handler(
			({ context, input }) => {
				return this.recordsService.deleteByUserId(
					userIdFromRequest(context.request),
					input.id,
					input.kind,
				);
			},
		);
	}
}
