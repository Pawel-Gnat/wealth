import { formatDistanceToNowStrict } from "date-fns";

export const formatNotificationTime = (createdAt: string) =>
	formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true });
