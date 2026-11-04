import type { Notification as NotificationModel } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Badge, Icon, Text } from "@/shared/components";
import { formatNotificationTime } from "../helpers/format-notification-time";
import { notificationIcon } from "../helpers/notification-icon";

type NotificationProps = {
	notification: NotificationModel;
	onSelect: () => void;
};

export const Notification = ({ notification, onSelect }: NotificationProps) => {
	const { t } = useTranslation();

	return (
		<li>
			<button
				type="button"
				className="w-full gap-1 rounded-2xl p-3 flex flex-col hover:bg-muted text-left"
				onClick={onSelect}
			>
				<div className="flex items-center gap-2 justify-between mb-1">
					<div className="flex items-center gap-2">
						<Icon
							name={notificationIcon(notification.event)}
							variant="filled"
							color="muted"
						/>
						<Text size="sm" weight="medium" className="truncate">
							{t(`${notification.event}.title`, { ns: "notifications" })}
						</Text>
					</div>
					{notification.readAt === null && (
						<Badge>{t("new", { ns: "notifications" })}</Badge>
					)}
				</div>
				<Text size="sm" color="muted">
					{t(`${notification.event}.body`, {
						ns: "notifications",
						budget: notification.metadata.budgetName,
					})}
				</Text>
				<Text size="xs" color="muted">
					{formatNotificationTime(notification.createdAt)}
				</Text>
			</button>
		</li>
	);
};
