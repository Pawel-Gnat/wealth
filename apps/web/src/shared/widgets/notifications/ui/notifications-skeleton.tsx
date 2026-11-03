import { Skeleton } from "@/shared/components";

export const NotificationsSkeleton = () => (
	<div className="flex flex-col gap-3">
		<Skeleton className="h-14 w-full" />
		<Skeleton className="h-14 w-full" />
		<Skeleton className="h-14 w-full" />
	</div>
);
