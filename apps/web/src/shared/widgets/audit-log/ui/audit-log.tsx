import type { AuditsParams, User } from "@repo/api/types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, ErrorState, Table } from "@/shared/components";
import { auditColumns } from "../config/audit-columns";
import { useAuditLog } from "../hooks/use-audit-log";

type AuditLogProps = {
	params: AuditsParams;
	users: User[];
};

export const AuditLog = ({ params, users }: AuditLogProps) => {
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useAuditLog(params);

	const columns = useMemo(
		() =>
			auditColumns({
				t,
				language: i18n.language,
				users,
			}),
		[i18n.language, t, users],
	);

	return (
		<Card title={t("title", { ns: "audits" })}>
			{isError ? (
				<ErrorState
					title={t("error.title", { ns: "audits" })}
					description={t("error.description", { ns: "audits" })}
				/>
			) : (
				<Table
					columns={columns}
					data={data}
					isLoading={isLoading}
					noResultsTitle={t("empty.title", { ns: "audits" })}
					noResultsDescription={t("empty.description", { ns: "audits" })}
					noResultsIcon="history"
				/>
			)}
		</Card>
	);
};
