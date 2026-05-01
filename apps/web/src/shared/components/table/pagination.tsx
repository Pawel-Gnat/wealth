import type { Table } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/lib/ui/select";
import { ButtonSecondary } from "../button";
import { Icon } from "../icons";
import { Text } from "../typography";

type PaginationProps<TData> = {
	table: Table<TData>;
};

export const Pagination = <TData,>({ table }: PaginationProps<TData>) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center justify-between flex-wrap gap-2">
			<div className="flex items-center gap-2">
				<Text size="xs">{t("pagination.rows-per-page", { ns: "common" })}</Text>
				<Select
					value={`${table.getState().pagination.pageSize}`}
					onValueChange={(value) => {
						table.setPageSize(Number(value));
					}}
				>
					<SelectTrigger>
						<SelectValue placeholder={table.getState().pagination.pageSize} />
					</SelectTrigger>
					<SelectContent side="top">
						{[10, 20, 25, 30, 40, 50].map((pageSize) => (
							<SelectItem key={pageSize} value={`${pageSize}`}>
								{pageSize}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center gap-2 flex-wrap">
				<Text size="xs">
					{t("pagination.page", { ns: "common" })}{" "}
					{table.getState().pagination.pageIndex + 1}{" "}
					{t("pagination.of", { ns: "common" })} {table.getPageCount()}
				</Text>

				<div className="flex items-center gap-2">
					<ButtonSecondary
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						{t("pagination.previous", { ns: "common" })}
						<Icon name="arrowLeft" />
					</ButtonSecondary>
					<ButtonSecondary
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						{t("pagination.next", { ns: "common" })}
						<Icon name="arrowRight" />
					</ButtonSecondary>
				</div>
			</div>
		</div>
	);
};
