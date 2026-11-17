import type { Notification as NotificationModel } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Button, Empty, ErrorState, Text } from "@/shared/components";
import { Notification } from "./notification";
import { NotificationsSkeleton } from "./notifications-skeleton";

type NotificationsPanelProps = {
	items: NotificationModel[];
	isLoading: boolean;
	isError: boolean;
	isMarkingAll: boolean;
	onMarkAllRead: () => void;
	onSelect: (notification: NotificationModel) => void;
};

export const NotificationsPanel = ({
	items,
	isLoading,
	isError,
	isMarkingAll,
	onMarkAllRead,
	onSelect,
}: NotificationsPanelProps) => {
	const { t } = useTranslation();
	const showMarkAll =
		items.some((item) => item.readAt === null) && !isLoading && !isError;

	return (
		<>
			<div className="flex items-center justify-between gap-2 border-b border-border p-2">
				<Text weight="medium">{t("title", { ns: "notifications" })}</Text>
				{showMarkAll && (
					<Button
						variant="ghost"
						size="sm"
						isLoading={isMarkingAll}
						onClick={onMarkAllRead}
					>
						{t("mark-all", { ns: "notifications" })}
					</Button>
				)}
			</div>

			<div className="my-2">
				{isLoading ? (
					<NotificationsSkeleton />
				) : isError ? (
					<ErrorState
						title={t("error.title", { ns: "notifications" })}
						description={t("error.description", { ns: "notifications" })}
					/>
				) : items.length === 0 ? (
					<Empty
						icon="bell"
						title={t("empty.title", { ns: "notifications" })}
						description={t("empty.description", { ns: "notifications" })}
					/>
				) : (
					<ul className="flex max-h-96 flex-col gap-1 overflow-y-auto">
						{items.map((item) => (
							<Notification
								key={item.id}
								notification={item}
								onSelect={() => onSelect(item)}
							/>
						))}
					</ul>
				)}
			</div>
		</>
	);
};
