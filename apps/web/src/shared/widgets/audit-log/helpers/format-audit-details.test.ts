import { AUTH_EVENTS, BUDGET_EVENTS, RECORD_EVENTS } from "@repo/api/events";
import type { Audit } from "@repo/api/types";
import { describe, expect, it } from "vitest";
import { formatAuditDetails } from "./format-audit-details";

const audit = (entry: Audit) => entry;

const lineItem = (title: string, quantity = 1, singleAmount = 10) => ({
	title,
	quantity,
	singleAmount,
});

describe("formatAuditDetails", () => {
	it("leaves auth, avatar, and membership cells empty", () => {
		expect(
			formatAuditDetails(
				audit({
					id: "1",
					actorId: "user",
					entityId: "user",
					event: AUTH_EVENTS.signedIn,
					metadata: {},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				"en-GB",
			),
		).toBe("");

		expect(
			formatAuditDetails(
				audit({
					id: "1",
					actorId: "user",
					entityId: "budget",
					event: BUDGET_EVENTS.memberInvited,
					metadata: { userId: "invitee" },
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				"en-GB",
			),
		).toBe("");
	});

	it("joins a name change and drops empty name parts", () => {
		expect(
			formatAuditDetails(
				audit({
					id: "1",
					actorId: "user",
					entityId: "user",
					event: AUTH_EVENTS.detailsUpdated,
					metadata: {
						oldValues: { firstName: "John", lastName: null },
						newValues: { firstName: "Jane", lastName: "Doe" },
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				"en-GB",
			),
		).toBe("John → Jane Doe");
	});

	it("shows only the new name when the previous one is empty", () => {
		expect(
			formatAuditDetails(
				audit({
					id: "1",
					actorId: "user",
					entityId: "user",
					event: AUTH_EVENTS.detailsUpdated,
					metadata: {
						oldValues: { firstName: null, lastName: null },
						newValues: { firstName: "Jane", lastName: "Doe" },
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				"en-GB",
			),
		).toBe("Jane Doe");
	});

	it("shows a budget title, and both titles after an edit", () => {
		expect(
			formatAuditDetails(
				audit({
					id: "1",
					actorId: "user",
					entityId: "budget",
					event: BUDGET_EVENTS.created,
					metadata: { title: "Holiday" },
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				"en-GB",
			),
		).toBe("Holiday");

		expect(
			formatAuditDetails(
				audit({
					id: "1",
					actorId: "user",
					entityId: "budget",
					event: BUDGET_EVENTS.updated,
					metadata: {
						oldValues: { title: "Holiday" },
						newValues: { title: "Trip" },
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				"en-GB",
			),
		).toBe("Holiday → Trip");
	});

	it("shows the document date and line-item titles for a created record", () => {
		expect(
			formatAuditDetails(
				audit({
					id: "1",
					actorId: "user",
					entityId: "record",
					event: RECORD_EVENTS.expense.created,
					metadata: {
						recordId: "record",
						date: "2026-03-03",
						lineItems: [lineItem("Rent"), lineItem("Coffee")],
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				"en-GB",
			),
		).toBe("3 March 2026, Rent, Coffee");
	});

	it("shows the same snapshot for a deleted record", () => {
		expect(
			formatAuditDetails(
				audit({
					id: "1",
					actorId: "user",
					entityId: "record",
					event: RECORD_EVENTS.income.deleted,
					metadata: {
						recordId: "record",
						date: "2026-03-03",
						lineItems: [lineItem("Salary")],
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				"en-GB",
			),
		).toBe("3 March 2026, Salary");
	});

	it("shows only the record fields that changed", () => {
		expect(
			formatAuditDetails(
				audit({
					id: "1",
					actorId: "user",
					entityId: "record",
					event: RECORD_EVENTS.expense.updated,
					metadata: {
						recordId: "record",
						oldValues: {
							date: "2026-03-03",
							lineItems: [lineItem("Rent")],
						},
						newValues: {
							date: "2026-03-04",
							lineItems: [lineItem("Rent", 2)],
						},
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				"en-GB",
			),
		).toBe("3 March 2026 → 4 March 2026, Rent → Rent");
	});

	it("omits a record field that stayed the same", () => {
		expect(
			formatAuditDetails(
				audit({
					id: "1",
					actorId: "user",
					entityId: "record",
					event: RECORD_EVENTS.expense.updated,
					metadata: {
						recordId: "record",
						oldValues: {
							date: "2026-03-03",
							lineItems: [lineItem("Rent"), lineItem("Coffee")],
						},
						newValues: {
							date: "2026-03-03",
							lineItems: [lineItem("Coffee"), lineItem("Rent")],
						},
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				"en-GB",
			),
		).toBe("Rent, Coffee → Coffee, Rent");
	});
});
