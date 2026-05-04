export function formatPrice(amount: number, language: string) {
	return new Intl.NumberFormat(language, {
		style: "currency",
		currency: "USD",
	}).format(amount);
}
