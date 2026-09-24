import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { TableBody, Table as TableUI } from "@/shared/lib/ui/table";
import type { IconName } from "../icons";
import { Pagination } from "./pagination";
import { DataTableEmpty } from "./table-empty";
import { DataTableHeader } from "./table-header";
import { DataTableRows } from "./table-rows";
import { DataTableSkeletonBody } from "./table-skeleton-body";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData, TValue> {
		className?: string;
	}
}

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading: boolean;
	noResultsTitle: string;
	noResultsDescription: string;
	noResultsIcon: IconName;
};

export const Table = <TData, TValue>({
	columns,
	data,
	isLoading,
	noResultsTitle,
	noResultsDescription,
	noResultsIcon,
}: DataTableProps<TData, TValue>) => {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className="flex flex-col gap-4">
			<div className="overflow-hidden rounded-md border">
				<TableUI>
					<DataTableHeader table={table} />
					<TableBody>
						{isLoading ? (
							<DataTableSkeletonBody table={table} />
						) : table.getRowModel().rows.length ? (
							<DataTableRows table={table} />
						) : (
							<DataTableEmpty
								colSpan={columns.length}
								title={noResultsTitle}
								description={noResultsDescription}
								icon={noResultsIcon}
							/>
						)}
					</TableBody>
				</TableUI>
			</div>
			{!isLoading && data.length > 0 && <Pagination table={table} />}
		</div>
	);
};
