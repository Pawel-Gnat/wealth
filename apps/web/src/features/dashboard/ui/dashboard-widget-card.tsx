import type { DashboardWidget, DashboardWidgetKind } from "@repo/api/schemas";
import { Badge, Card, Text } from "@/shared/components";
import { formatPrice } from "@/shared/helpers/price";
import { formatPercentChange } from "../helpers/format-percent-change";
import { getTrendBadgeVariant } from "../helpers/get-trend-badge-variant";

type DashboardWidgetCardProps = {
	label: string;
	widget: DashboardWidget;
	kind: DashboardWidgetKind;
	language: string;
};

export const DashboardWidgetCard = ({
	label,
	widget,
	kind,
	language,
}: DashboardWidgetCardProps) => {
	return (
		<Card
			content={
				<div className="flex flex-col gap-2">
					<Text size="sm" className="text-muted-foreground">
						{label}
					</Text>
					<div className="flex flex-wrap items-center gap-2">
						<Text size="lg" weight="bold">
							{formatPrice(widget.amount, language)}
						</Text>
						{widget.percentChange !== null && (
							<Badge variant={getTrendBadgeVariant(kind, widget.percentChange)}>
								{formatPercentChange(widget.percentChange)}
							</Badge>
						)}
					</div>
				</div>
			}
		/>
	);
};
