import type { Audit } from "@repo/api/types";
import {
	decodeDocumentDateFromStorage,
	formatDocumentDate,
} from "@repo/common/helpers";

type NameValues = Extract<
	Audit,
	{ event: "auth.details.updated" }
>["metadata"]["oldValues"];

type RecordValues = Extract<
	Audit,
	{ event: "expense.updated" | "income.updated" }
>["metadata"]["oldValues"];

type LineItemValues = RecordValues["lineItems"][number];

const formatDay = (stored: string, language: string) =>
	formatDocumentDate(decodeDocumentDateFromStorage(stored), language);

const formatName = (value: NameValues) =>
	[value.firstName, value.lastName].filter((part) => part).join(" ");

const formatTitles = (items: LineItemValues[]) =>
	items.map((item) => item.title).join(", ");

const formatArrow = (previous: string, next: string) => {
	if (!previous) {
		return next;
	}

	return `${previous} → ${next}`;
};

const lineItemsKey = (items: LineItemValues[]) =>
	JSON.stringify(
		items.map((item) => ({
			title: item.title,
			quantity: item.quantity,
			singleAmount: Number(item.singleAmount),
		})),
	);

const formatRecordSnapshot = (values: RecordValues, language: string) => {
	const day = formatDay(values.date, language);
	const titles = formatTitles(values.lineItems);

	return titles ? `${day}, ${titles}` : day;
};

const formatRecordChange = (
	previous: RecordValues,
	next: RecordValues,
	language: string,
) => {
	const parts: string[] = [];

	if (previous.date !== next.date) {
		parts.push(
			formatArrow(
				formatDay(previous.date, language),
				formatDay(next.date, language),
			),
		);
	}

	if (lineItemsKey(previous.lineItems) !== lineItemsKey(next.lineItems)) {
		parts.push(
			formatArrow(
				formatTitles(previous.lineItems),
				formatTitles(next.lineItems),
			),
		);
	}

	return parts.join(", ");
};

export const formatAuditDetails = (audit: Audit, language: string) => {
	switch (audit.event) {
		case "auth.signed-in":
		case "auth.signed-up":
		case "auth.logged-out":
		case "auth.password.updated":
		case "auth.avatar.updated":
		case "budget.member.invited":
		case "budget.invite.cancelled":
		case "budget.invite.accepted":
		case "budget.invite.rejected":
		case "budget.left":
			return "";
		case "auth.details.updated":
			return formatArrow(
				formatName(audit.metadata.oldValues),
				formatName(audit.metadata.newValues),
			);
		case "budget.created":
			return audit.metadata.title;
		case "budget.updated":
			return formatArrow(
				audit.metadata.oldValues.title,
				audit.metadata.newValues.title,
			);
		case "expense.created":
		case "income.created":
		case "expense.deleted":
		case "income.deleted":
			return formatRecordSnapshot(audit.metadata, language);
		case "expense.updated":
		case "income.updated":
			return formatRecordChange(
				audit.metadata.oldValues,
				audit.metadata.newValues,
				language,
			);
		default: {
			const unknownEvent: never = audit;
			return unknownEvent;
		}
	}
};
