import type { Audit, User } from "@repo/api/types";
import {
	decodeDocumentDateFromStorage,
	formatDocumentDate,
} from "@repo/common/helpers";
import type { TFunction } from "i18next";
import { formatPrice } from "@/shared/components/price/helpers/price.helpers";
import {
	getUserFullName,
	hasUserName,
} from "@/shared/helpers/get-user-full-name";

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

const formatPerson = (userId: string, users: User[], unknownLabel: string) => {
	const user = users.find((candidate) => candidate.id === userId);

	if (!user) {
		return unknownLabel;
	}

	const name = hasUserName(user) ? getUserFullName(user) : "";

	if (!name) {
		return user.email;
	}

	return `${name} (${user.email})`;
};

const formatItem = (item: LineItemValues, language: string) =>
	`${item.title} x ${item.quantity} x ${formatPrice(Number(item.singleAmount), language)}`;

const sameItem = (left: LineItemValues, right: LineItemValues) =>
	left.title === right.title &&
	left.quantity === right.quantity &&
	Number(left.singleAmount) === Number(right.singleAmount);

const formatLineItemChanges = (
	previous: LineItemValues[],
	next: LineItemValues[],
	language: string,
	t: TFunction,
) => {
	const count = Math.max(previous.length, next.length);
	const parts: string[] = [];

	for (let index = 0; index < count; index += 1) {
		const previousItem = previous[index];
		const nextItem = next[index];

		if (previousItem && nextItem) {
			if (!sameItem(previousItem, nextItem)) {
				parts.push(
					`${formatItem(previousItem, language)} → ${formatItem(nextItem, language)}`,
				);
			}
		} else if (nextItem) {
			parts.push(
				t("item-added", {
					ns: "audits",
					item: formatItem(nextItem, language),
				}),
			);
		} else if (previousItem) {
			parts.push(
				t("item-removed", {
					ns: "audits",
					item: formatItem(previousItem, language),
				}),
			);
		}
	}

	return parts;
};

const formatRecordChanges = (
	previous: RecordValues,
	next: RecordValues,
	language: string,
	t: TFunction,
) => {
	const parts: string[] = [];

	if (previous.date !== next.date) {
		parts.push(
			t("date-change", {
				ns: "audits",
				previous: formatDay(previous.date, language),
				next: formatDay(next.date, language),
			}),
		);
	}

	parts.push(
		...formatLineItemChanges(previous.lineItems, next.lineItems, language, t),
	);

	return parts.join(", ");
};

export const formatAuditDetails = (
	audit: Audit,
	language: string,
	users: User[],
	t: TFunction,
) => {
	const unknownUser = t("unknown-user", { ns: "audits" });

	switch (audit.event) {
		case "auth.signed-in":
		case "auth.signed-up":
		case "auth.logged-out":
		case "auth.password.updated":
		case "auth.avatar.updated":
			return t(audit.event, { ns: "events" });
		case "auth.details.updated": {
			const previous = formatName(audit.metadata.oldValues);
			const next = formatName(audit.metadata.newValues);

			if (!previous) {
				return t("auth.details.set", { ns: "events", name: next });
			}

			return t("auth.details.updated", { ns: "events", previous, next });
		}
		case "budget.created":
			return t(audit.event, { ns: "events", title: audit.metadata.title });
		case "budget.updated":
			return t(audit.event, {
				ns: "events",
				previous: audit.metadata.oldValues.title,
				next: audit.metadata.newValues.title,
			});
		case "budget.member.invited":
		case "budget.invite.cancelled":
		case "budget.invite.accepted":
		case "budget.invite.rejected":
		case "budget.left":
			return t(audit.event, {
				ns: "events",
				person: formatPerson(audit.metadata.userId, users, unknownUser),
			});
		case "expense.created":
		case "income.created":
		case "expense.deleted":
		case "income.deleted":
			return t(audit.event, {
				ns: "events",
				date: formatDay(audit.metadata.date, language),
			});
		case "expense.updated":
		case "income.updated":
			return t(audit.event, {
				ns: "events",
				date: formatDay(audit.metadata.oldValues.date, language),
				changes: formatRecordChanges(
					audit.metadata.oldValues,
					audit.metadata.newValues,
					language,
					t,
				),
			});
		default: {
			const unknownEvent: never = audit;
			return unknownEvent;
		}
	}
};
