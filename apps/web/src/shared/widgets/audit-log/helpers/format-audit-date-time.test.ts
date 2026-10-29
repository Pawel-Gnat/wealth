import { describe, expect, it } from "vitest";
import { formatAuditDateTime } from "./format-audit-date-time";

describe("formatAuditDateTime", () => {
	it("puts the document date and a 24-hour time in one string", () => {
		const formatted = formatAuditDateTime("2026-10-29T12:00:00.000Z", "en-GB");

		expect(formatted).toMatch(/^29 October 2026, \d{2}:\d{2}$/);
	});

	it("uses the active language for the month name", () => {
		const formatted = formatAuditDateTime("2026-10-29T12:00:00.000Z", "pl");

		expect(formatted).toMatch(/^29 października 2026, \d{2}:\d{2}$/);
	});
});
