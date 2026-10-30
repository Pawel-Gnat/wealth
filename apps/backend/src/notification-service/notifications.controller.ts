import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard";
import { userIdFromRequest } from "../guards/user-id-from-request";
import { NotificationsService } from "./notifications.service";

@Controller()
@UseGuards(SessionGuard)
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Implement(rpcContract.notifications.list)
	listNotificationsRpc() {
		return implement(rpcContract.notifications.list).handler(({ context }) => {
			return this.notificationsService.list(userIdFromRequest(context.request));
		});
	}

	@Implement(rpcContract.notifications.markRead)
	markNotificationReadRpc() {
		return implement(rpcContract.notifications.markRead).handler(
			({ context, input }) => {
				return this.notificationsService.markRead(
					userIdFromRequest(context.request),
					input.id,
				);
			},
		);
	}

	@Implement(rpcContract.notifications.markAllRead)
	markAllNotificationsReadRpc() {
		return implement(rpcContract.notifications.markAllRead).handler(
			({ context }) => {
				return this.notificationsService.markAllRead(
					userIdFromRequest(context.request),
				);
			},
		);
	}
}
