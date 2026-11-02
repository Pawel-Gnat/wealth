import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button, Empty, ErrorState, Icon, Text } from "@/shared/components";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/lib/ui/popover";
import { notificationHref } from "../helpers/notification-href";
import { useNotifications } from "../hooks/use-notifications";
import { Notification } from "./notification";
import { NotificationsSkeleton } from "./notifications-skeleton";

export const Notifications = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	const {
		items,
		isLoading,
		isError,
		isSuccess,
		hasUnread,
		markRead,
		markAllRead,
		isMarkingAll,
	} = useNotifications();
	const showMarkAll = hasUnread && !isLoading && !isError;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label={t("title", { ns: "notifications" })}
				>
					<div className="relative">
						<Icon name="bell" />
						{isSuccess && !isError && hasUnread && (
							<span className="absolute top-0 right-0 size-2 rounded-full bg-primary animate-pulse" />
						)}
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-95">
				<div className="flex items-center justify-between gap-2">
					<Text weight="medium">{t("title", { ns: "notifications" })}</Text>
					{showMarkAll && (
						<Button
							variant="ghost"
							size="sm"
							isLoading={isMarkingAll}
							onClick={() => markAllRead()}
						>
							{t("mark-all", { ns: "notifications" })}
						</Button>
					)}
				</div>

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
								onSelect={() => {
									setOpen(false);
									navigate(notificationHref(item));

									if (item.readAt === null) {
										markRead(item.id);
									}
								}}
							/>
						))}
					</ul>
				)}
			</PopoverContent>
		</Popover>
	);
};
