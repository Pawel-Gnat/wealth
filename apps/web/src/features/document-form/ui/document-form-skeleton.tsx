import { Skeleton } from "@/shared/lib/ui/skeleton";

export const DocumentFormSkeleton = () => {
	return (
		<div className="space-y-4">
			<Skeleton className="h-4 w-10" />
			<Skeleton className="h-9 w-full" />
			<Skeleton className="h-7 w-16" />
			<Skeleton className="h-0.5 w-full" />
			<Skeleton className="h-4 w-14" />
			<Skeleton className="h-40 w-full" />
		</div>
	);
};
