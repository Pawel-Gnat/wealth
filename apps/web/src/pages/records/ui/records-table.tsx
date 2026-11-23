import { DEFAULT_PAGE_SIZE } from "@repo/api/constants";
import { recordListParamsSchema } from "@repo/api/schemas";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { APP_ROUTES } from "@/app/routes";
import { ErrorState, Table } from "@/shared/components";
import { useUrlPagination } from "@/shared/hooks/use-url-pagination/use-url-pagination";
import { recordColumns } from "../config/record-columns";
import { useRecordsList } from "../hooks/use-records-list";

const recordPaginationFilters = {
	limit: recordListParamsSchema.shape.limit,
};

type RecordsTableProps = {
	budgetId?: string;
};

export const RecordsTable = ({ budgetId }: RecordsTableProps) => {
	const { t, i18n } = useTranslation();
	const { page, filters, setParams } = useUrlPagination(
		recordPaginationFilters,
	);
	const limit = filters.limit ?? DEFAULT_PAGE_SIZE;

	const { data, pagination, isLoading, isError } = useRecordsList({
		page,
		limit,
		...(budgetId ? { budgetId } : {}),
	});

	const errorTitle = t("list.error.title", { ns: "records" });
	const errorDescription = t("list.error.description", { ns: "records" });
	const emptyTitle = t("list.empty.title", { ns: "records" });
	const emptyDescription = t("list.empty.description", { ns: "records" });

	const columns = useMemo(
		() =>
			recordColumns({
				t,
				language: i18n.language,
				showOwner: Boolean(budgetId),
				getViewPath: (id) =>
					budgetId
						? APP_ROUTES.budgets.record(budgetId, id)
						: APP_ROUTES.records.view(id),
			}),
		[budgetId, i18n.language, t],
	);

	if (isError) {
		return <ErrorState title={errorTitle} description={errorDescription} />;
	}

	return (
		<Table
			columns={columns}
			data={data}
			noResultsTitle={emptyTitle}
			noResultsDescription={emptyDescription}
			noResultsIcon={budgetId ? "group" : "money"}
			isLoading={isLoading}
			page={page}
			pageSize={limit}
			pageCount={pagination.totalPages}
			onPaginationChange={({ page: nextPage, pageSize }) =>
				setParams({ page: nextPage, limit: pageSize })
			}
		/>
	);
};
