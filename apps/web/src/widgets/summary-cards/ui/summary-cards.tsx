type SummaryItem = {
	label: string;
	value: string;
};

type SummaryCardsProps = {
	items: SummaryItem[];
};

export function SummaryCards({ items }: SummaryCardsProps) {
	return (
		<ul className="grid gap-4 sm:grid-cols-3">
			{items.map((item) => (
				<li
					key={item.label}
					className="rounded-lg border bg-card p-4 shadow-sm"
				>
					<p className="text-sm text-muted-foreground">{item.label}</p>
					<p className="mt-1 text-xl font-semibold tabular-nums">
						{item.value}
					</p>
				</li>
			))}
		</ul>
	);
}
