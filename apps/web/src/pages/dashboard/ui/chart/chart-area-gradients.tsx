type ChartAreaGradientsProps = {
	expensesGradientId: string;
	incomesGradientId: string;
};

export const ChartAreaGradients = ({
	expensesGradientId,
	incomesGradientId,
}: ChartAreaGradientsProps) => {
	return (
		<defs>
			<linearGradient id={expensesGradientId} x1="0" y1="0" x2="0" y2="1">
				<stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
				<stop
					offset="95%"
					stopColor="var(--color-expenses)"
					stopOpacity={0.1}
				/>
			</linearGradient>
			<linearGradient id={incomesGradientId} x1="0" y1="0" x2="0" y2="1">
				<stop offset="5%" stopColor="var(--color-incomes)" stopOpacity={0.8} />
				<stop offset="95%" stopColor="var(--color-incomes)" stopOpacity={0.1} />
			</linearGradient>
		</defs>
	);
};
