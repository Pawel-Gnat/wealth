import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button, Icon } from "@/shared/components";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/lib/ui/popover";
import { notificationHref } from "../helpers/notification-href";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationsPanel } from "./notifications-panel";

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
							<span className="absolute top-0 right-0 size-2 rounded-full bg-destructive" />
						)}
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-fit max-w-95 min-w-72 p-2 gap-2">
				<NotificationsPanel
					items={items}
					isLoading={isLoading}
					isError={isError}
					isMarkingAll={isMarkingAll}
					onMarkAllRead={() => markAllRead()}
					onSelect={(item) => {
						setOpen(false);
						navigate(notificationHref(item));

						if (item.readAt === null) {
							markRead(item.id);
						}
					}}
				/>
			</PopoverContent>
		</Popover>
	);
};
