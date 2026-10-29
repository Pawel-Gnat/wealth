import { AUTH_EVENTS, BUDGET_EVENTS, RECORD_EVENTS } from "@repo/api/events";
import type { Audit, User } from "@repo/api/types";
import {
	decodeDocumentDateFromStorage,
	formatDocumentDate,
} from "@repo/common/helpers";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { formatPrice } from "@/shared/components/price/helpers/price.helpers";
import {
	getUserFullName,
	hasUserName,
} from "@/shared/helpers/get-user-full-name";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { formatAuditDetails } from "./format-audit-details";

const audit = (entry: Audit) => entry;

const lineItem = (title: string, quantity = 1, singleAmount = 10) => ({
	title,
	quantity,
	singleAmount,
});

const invitee: User = {
	id: "invitee",
	email: "jane@example.com",
	firstName: "Jane",
	lastName: "Doe",
};

const language = "en-GB";

const day = (stored: string) =>
	formatDocumentDate(decodeDocumentDateFromStorage(stored), language);

const namedPerson = (user: User) => {
	const name = hasUserName(user) ? getUserFullName(user) : "";

	return name ? `${name} (${user.email})` : user.email;
};

const pricedItem = (title: string, quantity = 1, singleAmount = 10) =>
	`${title} x ${quantity} x ${formatPrice(singleAmount, language)}`;

const describeAudit = (entry: Audit, users: User[] = []) =>
	formatAuditDetails(entry, language, users, t);

let t: TFunction;

describe("formatAuditDetails", () => {
	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("describes sign-in and a password change", () => {
		expect(
			describeAudit(
				audit({
					id: "1",
					actorId: "user",
					entityId: "user",
					event: AUTH_EVENTS.signedIn,
					metadata: {},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
			),
		).toBe(t(AUTH_EVENTS.signedIn, { ns: "events" }));

		expect(
			describeAudit(
				audit({
					id: "1",
					actorId: "user",
					entityId: "user",
					event: AUTH_EVENTS.passwordUpdated,
					metadata: {},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
			),
		).toBe(t(AUTH_EVENTS.passwordUpdated, { ns: "events" }));
	});

	it("names the invited person and their email", () => {
		expect(
			describeAudit(
				audit({
					id: "1",
					actorId: "user",
					entityId: "budget",
					event: BUDGET_EVENTS.memberInvited,
					metadata: { userId: invitee.id },
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				[invitee],
			),
		).toBe(
			t(BUDGET_EVENTS.memberInvited, {
				ns: "events",
				person: namedPerson(invitee),
			}),
		);
	});

	it("uses the email when the person has no name", () => {
		const nameless: User = {
			id: "invitee",
			email: "jane@example.com",
			firstName: null,
			lastName: null,
		};

		expect(
			describeAudit(
				audit({
					id: "1",
					actorId: "user",
					entityId: "budget",
					event: BUDGET_EVENTS.left,
					metadata: { userId: nameless.id },
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
				[nameless],
			),
		).toBe(
			t(BUDGET_EVENTS.left, {
				ns: "events",
				person: namedPerson(nameless),
			}),
		);
	});

	it("uses an unknown user when the person is missing", () => {
		expect(
			describeAudit(
				audit({
					id: "1",
					actorId: "user",
					entityId: "budget",
					event: BUDGET_EVENTS.inviteCancelled,
					metadata: { userId: "missing" },
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
			),
		).toBe(
			t(BUDGET_EVENTS.inviteCancelled, {
				ns: "events",
				person: t("unknown-user", { ns: "audits" }),
			}),
		);
	});

	it("joins a name change and drops empty name parts", () => {
		expect(
			describeAudit(
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
			),
		).toBe(
			t("auth.details.updated", {
				ns: "events",
				previous: "John",
				next: "Jane Doe",
			}),
		);
	});

	it("shows only the new name when the previous one is empty", () => {
		expect(
			describeAudit(
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
			),
		).toBe(
			t("auth.details.set", {
				ns: "events",
				name: "Jane Doe",
			}),
		);
	});

	it("shows a budget title, and both titles after an edit", () => {
		expect(
			describeAudit(
				audit({
					id: "1",
					actorId: "user",
					entityId: "budget",
					event: BUDGET_EVENTS.created,
					metadata: { title: "Holiday" },
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
			),
		).toBe(
			t(BUDGET_EVENTS.created, {
				ns: "events",
				title: "Holiday",
			}),
		);

		expect(
			describeAudit(
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
			),
		).toBe(
			t(BUDGET_EVENTS.updated, {
				ns: "events",
				previous: "Holiday",
				next: "Trip",
			}),
		);
	});

	it("shows the document date for a created record", () => {
		expect(
			describeAudit(
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
			),
		).toBe(
			t(RECORD_EVENTS.expense.created, {
				ns: "events",
				date: day("2026-03-03"),
			}),
		);
	});

	it("shows the document date for a deleted record", () => {
		expect(
			describeAudit(
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
			),
		).toBe(
			t(RECORD_EVENTS.income.deleted, {
				ns: "events",
				date: day("2026-03-03"),
			}),
		);
	});

	it("lists the date and each changed line item", () => {
		expect(
			describeAudit(
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
							lineItems: [lineItem("Rent", 2, 12)],
						},
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
			),
		).toBe(
			t(RECORD_EVENTS.expense.updated, {
				ns: "events",
				date: day("2026-03-03"),
				changes: [
					t("date-change", {
						ns: "audits",
						previous: day("2026-03-03"),
						next: day("2026-03-04"),
					}),
					`${pricedItem("Rent")} → ${pricedItem("Rent", 2, 12)}`,
				].join(", "),
			}),
		);
	});

	it("lists an added item and a removed item", () => {
		expect(
			describeAudit(
				audit({
					id: "1",
					actorId: "user",
					entityId: "record",
					event: RECORD_EVENTS.income.updated,
					metadata: {
						recordId: "record",
						oldValues: {
							date: "2026-03-03",
							lineItems: [lineItem("Salary"), lineItem("Bonus", 2, 5)],
						},
						newValues: {
							date: "2026-03-03",
							lineItems: [lineItem("Salary"), lineItem("Gift", 1, 8)],
						},
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
			),
		).toBe(
			t(RECORD_EVENTS.income.updated, {
				ns: "events",
				date: day("2026-03-03"),
				changes: `${pricedItem("Bonus", 2, 5)} → ${pricedItem("Gift", 1, 8)}`,
			}),
		);
	});

	it("marks an item that was added or removed", () => {
		expect(
			describeAudit(
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
							date: "2026-03-03",
							lineItems: [lineItem("Rent"), lineItem("Coffee")],
						},
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
			),
		).toBe(
			t(RECORD_EVENTS.expense.updated, {
				ns: "events",
				date: day("2026-03-03"),
				changes: t("item-added", {
					ns: "audits",
					item: pricedItem("Coffee"),
				}),
			}),
		);

		expect(
			describeAudit(
				audit({
					id: "1",
					actorId: "user",
					entityId: "record",
					event: RECORD_EVENTS.expense.updated,
					metadata: {
						recordId: "record",
						oldValues: {
							date: "2026-03-03",
							lineItems: [lineItem("Rent"), lineItem("Tea")],
						},
						newValues: {
							date: "2026-03-03",
							lineItems: [lineItem("Rent")],
						},
					},
					createdAt: "2026-10-29T12:00:00.000Z",
				}),
			),
		).toBe(
			t(RECORD_EVENTS.expense.updated, {
				ns: "events",
				date: day("2026-03-03"),
				changes: t("item-removed", {
					ns: "audits",
					item: pricedItem("Tea"),
				}),
			}),
		);
	});
});
