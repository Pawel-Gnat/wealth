import { summaryKinds } from "@repo/api/schemas";
import { SummaryCardSkeleton } from "../summary-card/summary-card";

export const SummarySkeleton = () => {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			{summaryKinds.map((kind) => (
				<SummaryCardSkeleton key={kind} />
			))}
		</div>
	);
};
