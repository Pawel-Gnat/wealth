import type { Notification, NotificationListResponse } from "@repo/api/types";
import {
	hashKey,
	type QueryClient,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/shared/components";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import type { NotificationSseEvent } from "@/shared/lib/sse";
import {
	subscribeSseConnectionOpen,
	subscribeSseNotifications,
} from "@/shared/lib/sse";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";
import {
	applyNotificationEvent,
	mergeNotifications,
} from "../helpers/apply-notification-event";

const notificationsKey = queryKeys.notifications();
const notificationsQueryHash = hashKey(notificationsKey);

const notificationQueryState = (queryClient: QueryClient) =>
	queryClient.getQueryState<NotificationListResponse>(notificationsKey);

const updateNotifications = (
	queryClient: QueryClient,
	updater: (items: Notification[]) => Notification[],
) => {
	queryClient.setQueryData<NotificationListResponse>(
		notificationsKey,
		(current) => {
			if (!current) {
				return current;
			}

			return { data: updater(current.data) };
		},
	);
};

export const useNotifications = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const pendingEvents = useRef<NotificationSseEvent[]>([]);

	const query = useQuery({
		queryKey: notificationsKey,
		queryFn: () => controlledAsync(() => orpcClient.notifications.list()),
		staleTime: Infinity,
		retry: 1,
		refetchOnReconnect: false,
		select: (response) => response.data,
	});

	useEffect(() => {
		const unsubscribeNotifications = subscribeSseNotifications((event) => {
			const state = notificationQueryState(queryClient);
			if (state?.status === "error") {
				return;
			}

			if (state?.fetchStatus === "fetching") {
				pendingEvents.current.push(event);
				return;
			}

			updateNotifications(queryClient, (items) =>
				applyNotificationEvent(items, event),
			);
		});

		const unsubscribeOpen = subscribeSseConnectionOpen(() => {
			const state = notificationQueryState(queryClient);
			if (state?.status === "error") {
				return;
			}

			void queryClient.refetchQueries({ queryKey: notificationsKey });
		});

		const unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
			if (
				event.type !== "updated" ||
				event.action.type !== "success" ||
				event.action.manual
			) {
				return;
			}

			if (event.query.queryHash !== notificationsQueryHash) {
				return;
			}

			const pending = pendingEvents.current.splice(0);
			if (pending.length === 0) {
				return;
			}

			updateNotifications(queryClient, (items) =>
				mergeNotifications(items, pending),
			);
		});

		return () => {
			unsubscribeNotifications();
			unsubscribeOpen();
			unsubscribeCache();
		};
	}, [queryClient]);

	const markRead = useMutation({
		mutationFn: (id: string) =>
			controlledAsync(() => orpcClient.notifications.markRead({ id })),
		onSuccess: (response) => {
			updateNotifications(queryClient, (items) =>
				items.map((item) =>
					item.id === response.data.id
						? { ...item, readAt: response.data.readAt }
						: item,
				),
			);
		},
		onError: () => {
			toast.error(t("toast.error.notification-marked-read", { ns: "common" }));
		},
	});

	const markAllRead = useMutation({
		mutationFn: () =>
			controlledAsync(() => orpcClient.notifications.markAllRead()),
		onSuccess: (response) => {
			const { readAt, ids } = response.data;
			if (readAt) {
				const markedIds = new Set(ids);
				updateNotifications(queryClient, (items) =>
					items.map((item) =>
						markedIds.has(item.id) ? { ...item, readAt } : item,
					),
				);
			}

			toast.success(
				t("toast.success.notifications-updated", { ns: "common" }),
				{
					description: t("toast.success.notifications-marked-read", {
						ns: "common",
					}),
				},
			);
		},
		onError: () => {
			toast.error(t("toast.error.notifications-marked-read", { ns: "common" }));
		},
	});

	const items = query.data ?? [];

	return {
		items,
		isLoading: query.isPending,
		isError: query.isError,
		isSuccess: query.isSuccess,
		hasUnread: items.some((item) => item.readAt === null),
		markRead: markRead.mutate,
		markAllRead: markAllRead.mutate,
		isMarkingAll: markAllRead.isPending,
	};
};
