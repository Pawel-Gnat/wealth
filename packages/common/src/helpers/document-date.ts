export function encodeDocumentDateForStorage(date: Date): string {
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth() + 1;
	const day = date.getUTCDate();

	return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function decodeDocumentDateFromStorage(stored: string | Date): Date {
	const iso =
		typeof stored === "string"
			? stored.slice(0, 10)
			: stored.toISOString().slice(0, 10);

	return new Date(`${iso}T12:00:00.000Z`);
}

export function normalizeDocumentDateForApi(date: Date): Date {
	return new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
	);
}

export function isSameCalendarDate(a: Date, b: Date): boolean {
	return encodeDocumentDateForStorage(a) === encodeDocumentDateForStorage(b);
}

export function isStoredDocumentDateEqual(stored: string, date: Date): boolean {
	return stored === encodeDocumentDateForStorage(date);
}
