import { Skeleton as SkeletonUI } from "@/shared/lib/ui/skeleton";

type SkeletonProps = {
	className?: string | undefined;
};

export const Skeleton = ({ className }: SkeletonProps) => {
	return <SkeletonUI className={className} />;
};
