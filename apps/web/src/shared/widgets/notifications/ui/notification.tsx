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
				className="flex w-full gap-3 rounded-2xl px-2 py-2 text-left hover:bg-muted"
				onClick={onSelect}
			>
				<Icon name={notificationIcon(notification.event)} />
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<div className="flex items-center gap-2">
						<Text weight="medium" className="truncate">
							{t(`${notification.event}.title`, { ns: "notifications" })}
						</Text>
						{notification.readAt === null ? (
							<Badge>{t("new", { ns: "notifications" })}</Badge>
						) : null}
					</div>
					<Text size="sm" color="muted">
						{t(`${notification.event}.body`, {
							ns: "notifications",
							budget: notification.metadata.budgetName,
						})}
					</Text>
					<Text size="sm" color="muted">
						{formatNotificationTime(notification.createdAt)}
					</Text>
				</div>
			</button>
		</li>
	);
};
