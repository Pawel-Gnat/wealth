export const formatPercentChange = (percentChange: number): string => {
	const formatted = percentChange.toFixed(1);

	if (percentChange > 0) {
		return `+${formatted}%`;
	}

	return `${formatted}%`;
};
