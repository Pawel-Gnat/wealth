import { Card } from "@/shared/components";
import { Skeleton } from "@/shared/lib/ui/skeleton";

const DashboardWidgetCardSkeleton = () => {
	return (
		<Card
			content={
				<div className="flex flex-col gap-3">
					<Skeleton className="h-4 w-32" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-28" />
						<Skeleton className="h-5 w-14" />
					</div>
				</div>
			}
		/>
	);
};

export const DashboardWidgetsSkeleton = () => {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			<DashboardWidgetCardSkeleton />
			<DashboardWidgetCardSkeleton />
			<DashboardWidgetCardSkeleton />
		</div>
	);
};
