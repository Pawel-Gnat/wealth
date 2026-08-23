import type { Summary, SummaryKind } from "@repo/api/schemas";
import { Badge, Card, Price, Text } from "@/shared/components";
import { Skeleton } from "@/shared/lib/ui/skeleton";
import { formatPercentChange } from "../../helpers/format-percent-change";
import { getTrendBadgeVariant } from "../../helpers/get-trend-badge-variant";

type SummaryCardProps = {
	label: string;
	summary: Summary;
	kind: SummaryKind;
	language: string;
};

export const SummaryCard = ({
	label,
	summary,
	kind,
	language,
}: SummaryCardProps) => {
	return (
		<Card
			content={
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap items-center gap-2">
						<Text size="sm" className="text-muted-foreground">
							{label}
						</Text>
						{summary.percentChange !== null && (
							<Badge
								variant={getTrendBadgeVariant(kind, summary.percentChange)}
							>
								{formatPercentChange(summary.percentChange)}
							</Badge>
						)}
					</div>
					<Price
						size="lg"
						weight="bold"
						amount={summary.amount}
						language={language}
					/>
				</div>
			}
		/>
	);
};

export const SummaryCardSkeleton = () => {
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
