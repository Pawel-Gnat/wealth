import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard";
import { userIdFromRequest } from "../guards/user-id-from-request";
import { DocumentsService } from "./documents.service";

@Controller()
@UseGuards(SessionGuard)
export class DocumentsController {
	constructor(private readonly documentsService: DocumentsService) {}

	@Implement(rpcContract.documents.list)
	listDocumentsRpc() {
		return implement(rpcContract.documents.list).handler(
			({ context, input }) => {
				return this.documentsService.listByUserId(
					userIdFromRequest(context.request),
					input.kind,
				);
			},
		);
	}

	@Implement(rpcContract.documents.create)
	createDocumentRpc() {
		return implement(rpcContract.documents.create).handler(
			({ context, input }) => {
				return this.documentsService.createByUserId(
					userIdFromRequest(context.request),
					input.kind,
					{ date: input.date, lineItems: input.lineItems },
				);
			},
		);
	}

	@Implement(rpcContract.documents.get)
	getDocumentRpc() {
		return implement(rpcContract.documents.get).handler(
			({ context, input }) => {
				return this.documentsService.getByUserId(
					userIdFromRequest(context.request),
					input.id,
					input.kind,
				);
			},
		);
	}

	@Implement(rpcContract.documents.update)
	updateDocumentRpc() {
		return implement(rpcContract.documents.update).handler(
			({ context, input }) => {
				return this.documentsService.updateByUserId(
					userIdFromRequest(context.request),
					input.id,
					input.kind,
					{ date: input.date, lineItems: input.lineItems },
				);
			},
		);
	}

	@Implement(rpcContract.documents.delete)
	deleteDocumentRpc() {
		return implement(rpcContract.documents.delete).handler(
			({ context, input }) => {
				return this.documentsService.deleteByUserId(
					userIdFromRequest(context.request),
					input.id,
					input.kind,
				);
			},
		);
	}
}
