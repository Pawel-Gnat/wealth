import type { Audit, User } from "@repo/api/types";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Text } from "@/shared/components";
import { formatAuditDateTime } from "../helpers/format-audit-date-time";
import { formatAuditDetails } from "../helpers/format-audit-details";
import { AuditActor } from "../ui/audit-actor";

type AuditColumnsProps = {
	t: TFunction;
	language: string;
	users: User[];
};

export const auditColumns = ({
	t,
	language,
	users,
}: AuditColumnsProps): ColumnDef<Audit>[] => [
	{
		accessorKey: "createdAt",
		meta: { className: "w-[1%] whitespace-nowrap" },
		header: () => (
			<Text size="sm" weight="medium">
				{t("common.date", { ns: "common" })}
			</Text>
		),
		cell: ({ row }) => (
			<Text size="sm">
				{formatAuditDateTime(row.original.createdAt, language)}
			</Text>
		),
	},
	{
		accessorKey: "actorId",
		meta: { className: "w-[1%] whitespace-nowrap" },
		header: () => (
			<Text size="sm" weight="medium">
				{t("actor", { ns: "audits" })}
			</Text>
		),
		cell: ({ row }) => (
			<AuditActor actorId={row.original.actorId} users={users} />
		),
	},
	{
		accessorKey: "event",
		header: () => (
			<Text size="sm" weight="medium">
				{t("event", { ns: "audits" })}
			</Text>
		),
		cell: ({ row }) => (
			<Text size="sm">{t(row.original.event, { ns: "events" })}</Text>
		),
	},
	{
		accessorKey: "metadata",
		meta: { className: "w-full" },
		header: () => (
			<Text size="sm" weight="medium">
				{t("details", { ns: "audits" })}
			</Text>
		),
		cell: ({ row }) => (
			<Text size="sm">{formatAuditDetails(row.original, language)}</Text>
		),
	},
];
