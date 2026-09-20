import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement, ORPCError } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard.js";
import { StorageService } from "./storage.service.js";

@Controller()
@UseGuards(SessionGuard)
export class StorageController {
	constructor(private readonly storageService: StorageService) {}

	@Implement(rpcContract.storage.get)
	getStorageRpc() {
		return implement(rpcContract.storage.get).handler(async ({ input }) => {
			try {
				return await this.storageService.getPublicUrl(input.id);
			} catch (error) {
				if (
					error instanceof Error &&
					error.message === "Storage object not found"
				) {
					throw new ORPCError("NOT_FOUND", { message: error.message });
				}
				throw error;
			}
		});
	}
}
