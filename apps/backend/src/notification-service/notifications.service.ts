import { Inject, Injectable, Logger } from "@nestjs/common";
import { ORPCError } from "@orpc/nest";
import { NOTIFICATION_NOT_FOUND } from "@repo/api/schemas";
import type {
	NotificationCreatedEvent,
	NotificationReadEvent,
	NotificationsReadEvent,
	SseEvent,
} from "@repo/api/types";
import { and, desc, eq, isNull } from "drizzle-orm";
import { ulid } from "ulid";
import { DBS } from "../database-service/constants";
import { notificationsTable } from "../database-service/tables/index";
import type {
	Database,
	DatabaseTransaction,
	NotificationRow,
} from "../database-service/types/types";
import { SsePublisher } from "../sse-service/sse-publisher.service";
import { parseNotification } from "./helpers/parse-notification";
import { toIso } from "./helpers/to-iso";

export type NewNotification = Pick<
	NotificationRow,
	"userId" | "event" | "metadata"
>;

@Injectable()
export class NotificationsService {
	private readonly logger = new Logger(NotificationsService.name);

	constructor(
		@Inject(DBS.APP) private readonly db: Database,
		private readonly ssePublisher: SsePublisher,
	) {}

	async create(tx: DatabaseTransaction, entries: NewNotification[]) {
		if (entries.length === 0) {
			return [];
		}

		return tx.insert(notificationsTable).values(entries).returning();
	}

	async publish(rows: NotificationRow[]) {
		for (const row of rows) {
			const notification = parseNotification(row);
			if (!notification) {
				continue;
			}

			const event: NotificationCreatedEvent = {
				type: "notification-created",
				id: ulid(),
				occurredAt: new Date().toISOString(),
				notification,
			};

			await this.publishBestEffort(row.userId, event);
		}
	}

	async list(userId: string) {
		const rows = await this.db
			.select()
			.from(notificationsTable)
			.where(eq(notificationsTable.userId, userId))
			.orderBy(desc(notificationsTable.createdAt), desc(notificationsTable.id));

		return {
			data: rows.flatMap((row) => {
				const notification = parseNotification(row);
				return notification ? [notification] : [];
			}),
		};
	}

	async markRead(userId: string, id: string) {
		const existing = await this.findOwn(userId, id);
		if (existing.readAt) {
			return { data: { id, readAt: toIso(existing.readAt) } };
		}

		const readAt = new Date();
		const [updated] = await this.db
			.update(notificationsTable)
			.set({ readAt })
			.where(
				and(
					eq(notificationsTable.id, id),
					eq(notificationsTable.userId, userId),
					isNull(notificationsTable.readAt),
				),
			)
			.returning({ id: notificationsTable.id });

		if (!updated) {
			const current = await this.findOwn(userId, id);
			return { data: { id, readAt: toIso(current.readAt ?? readAt) } };
		}

		const readAtIso = toIso(readAt);
		const event: NotificationReadEvent = {
			type: "notification-read",
			id: ulid(),
			occurredAt: new Date().toISOString(),
			notificationId: id,
			readAt: readAtIso,
		};

		await this.publishBestEffort(userId, event);

		return { data: { id, readAt: readAtIso } };
	}

	async markAllRead(userId: string) {
		const readAt = new Date();
		const updated = await this.db
			.update(notificationsTable)
			.set({ readAt })
			.where(
				and(
					eq(notificationsTable.userId, userId),
					isNull(notificationsTable.readAt),
				),
			)
			.returning({ id: notificationsTable.id });

		if (updated.length === 0) {
			return { data: { readAt: null } };
		}

		const readAtIso = toIso(readAt);
		const event: NotificationsReadEvent = {
			type: "notifications-read",
			id: ulid(),
			occurredAt: new Date().toISOString(),
			readAt: readAtIso,
		};

		await this.publishBestEffort(userId, event);

		return { data: { readAt: readAtIso } };
	}

	private async findOwn(userId: string, id: string) {
		const [row] = await this.db
			.select()
			.from(notificationsTable)
			.where(
				and(
					eq(notificationsTable.id, id),
					eq(notificationsTable.userId, userId),
				),
			);

		if (!row) {
			throw new ORPCError("NOT_FOUND", { message: NOTIFICATION_NOT_FOUND });
		}

		return row;
	}

	private async publishBestEffort(userId: string, event: SseEvent) {
		try {
			await this.ssePublisher.publish(userId, event);
		} catch (error) {
			this.logger.warn(
				`Failed to publish ${event.type} for ${userId}: ${error instanceof Error ? error.message : "unknown error"}`,
			);
		}
	}
}
