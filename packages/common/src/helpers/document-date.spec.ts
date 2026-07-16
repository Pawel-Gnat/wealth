import { describe, expect, it } from "vitest";
import {
	decodeDocumentDateFromStorage,
	encodeDocumentDateForStorage,
	isSameCalendarDate,
	isStoredDocumentDateEqual,
	normalizeDocumentDateForApi,
} from "./document-date";

describe("document date helpers", () => {
	it("encodes a UTC calendar date as YYYY-MM-DD", () => {
		const date = new Date("2026-01-15T00:00:00.000Z");

		expect(encodeDocumentDateForStorage(date)).toBe("2026-01-15");
	});

	it("decodes a stored date string to UTC noon", () => {
		expect(decodeDocumentDateFromStorage("2026-01-15")).toEqual(
			new Date("2026-01-15T12:00:00.000Z"),
		);
	});

	it("decodes a stored Date value using its ISO date part", () => {
		expect(
			decodeDocumentDateFromStorage(new Date("2026-01-15T00:00:00.000Z")),
		).toEqual(new Date("2026-01-15T12:00:00.000Z"));
	});

	it("normalizes a local calendar date to UTC midnight for API transport", () => {
		const localDate = new Date(2026, 0, 15, 15, 30, 0);

		expect(normalizeDocumentDateForApi(localDate)).toEqual(
			new Date("2026-01-15T00:00:00.000Z"),
		);
	});

	it("compares calendar dates by encoded storage value", () => {
		const left = new Date("2026-01-15T00:00:00.000Z");
		const right = new Date("2026-01-15T23:59:59.000Z");

		expect(isSameCalendarDate(left, right)).toBe(true);
		expect(isSameCalendarDate(left, new Date("2026-01-16T00:00:00.000Z"))).toBe(
			false,
		);
	});

	it("compares stored string values with incoming dates", () => {
		const date = new Date("2026-05-01T00:00:00.000Z");

		expect(isStoredDocumentDateEqual("2026-05-01", date)).toBe(true);
		expect(isStoredDocumentDateEqual("2026-05-02", date)).toBe(false);
	});
});
