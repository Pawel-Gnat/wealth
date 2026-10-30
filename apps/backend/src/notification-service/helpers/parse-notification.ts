import { notificationSchema } from "@repo/api/schemas";
import type { NotificationRow } from "../../database-service/types/types";
import { toIso } from "./to-iso";

export const parseNotification = (row: NotificationRow) => {
	const parsed = notificationSchema.safeParse({
		...row,
		createdAt: toIso(row.createdAt),
		readAt: row.readAt ? toIso(row.readAt) : null,
	});

	return parsed.success ? parsed.data : null;
};
