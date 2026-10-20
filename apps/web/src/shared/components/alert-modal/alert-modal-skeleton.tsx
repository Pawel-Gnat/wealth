import { createPortal } from "react-dom";
import { Skeleton } from "../skeleton";

export const AlertModalSkeleton = () => {
	return createPortal(
		<>
			<div className="fixed inset-0 z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm" />
			<Skeleton className="fixed top-1/2 left-1/2 z-50 h-44 w-full max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-4xl shadow-xl ring-1 ring-foreground/5 sm:max-w-md" />
		</>,
		document.body,
	);
};
