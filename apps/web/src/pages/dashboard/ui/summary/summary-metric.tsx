import type { Summary, SummaryKind } from "@repo/api/types";
import { cn } from "cn";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Icon, Price, Skeleton, Text } from "@/shared/components";
import { formatPercentChange } from "../../helpers/format-percent-change";
import { getTrendBadgeVariant } from "../../helpers/get-trend-badge-variant";

type SummaryMetricProps = {
	title: string;
	summary?: Summary | undefined;
	kind: SummaryKind;
	isLoading: boolean;
};

export const SummaryMetric = ({
	title,
	summary,
	kind,
	isLoading,
}: SummaryMetricProps) => {
	const { t, i18n } = useTranslation();

	const icon = useMemo(() => {
		switch (kind) {
			case "expenses":
				return "expense";
			case "incomes":
				return "income";
			case "netBalance":
				return "balance";
		}
	}, [kind]);

	const iconClassName = useMemo(() => {
		switch (kind) {
			case "expenses":
				return "bg-destructive/10 text-destructive";
			case "incomes":
				return "bg-success/10 text-success";
			case "netBalance":
				return "bg-primary";
		}
	}, [kind]);

	const balanceClassName = "bg-muted rounded-xl";

	return (
		<div
			className={cn(
				"flex flex-col gap-2 p-4",
				kind === "netBalance" && balanceClassName,
			)}
		>
			<Icon
				name={icon}
				className={cn("size-8 p-2 rounded-full", iconClassName)}
			/>
			<Text size="sm" color="muted">
				{title}
			</Text>

			{isLoading || summary == null ? (
				<Skeleton className="h-7 w-14" />
			) : (
				<Price
					size="lg"
					weight="bold"
					amount={summary.amount}
					language={i18n.language}
				/>
			)}

			{isLoading || summary == null ? (
				<Skeleton className="h-4 w-40" />
			) : summary.amount === 0 ? (
				<Text size="xs" color="muted">
					{t("summary.empty", { ns: "dashboard" })}
				</Text>
			) : (
				summary.percentChange !== null && (
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant={getTrendBadgeVariant(kind, summary.percentChange)}>
							{formatPercentChange(summary.percentChange)}
						</Badge>
						<Text size="xs" color="muted">
							{t("summary.vs-previous-period", { ns: "dashboard" })}
						</Text>
					</div>
				)
			)}
		</div>
	);
};
