import { DEFAULT_PAGE_SIZE } from "@repo/api/constants";
import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	type PaginationState,
	type Updater,
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

const resolveUpdater = (
	updater: Updater<PaginationState>,
	current: PaginationState,
) => (typeof updater === "function" ? updater(current) : updater);

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading: boolean;
	noResultsTitle: string;
	noResultsDescription: string;
	noResultsIcon: IconName;
	page?: number;
	pageCount?: number;
	onPageChange?: (page: number) => void;
};

export const Table = <TData, TValue>({
	columns,
	data,
	isLoading,
	noResultsTitle,
	noResultsDescription,
	noResultsIcon,
	page = 1,
	pageCount,
	onPageChange,
}: DataTableProps<TData, TValue>) => {
	const pageIndex = Math.max(0, page - 1);
	const serverPaged = onPageChange !== undefined && pageCount !== undefined;
	const pagination: PaginationState = {
		pageIndex,
		pageSize: DEFAULT_PAGE_SIZE,
	};

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		...(serverPaged
			? {
					manualPagination: true,
					pageCount,
					autoResetPageIndex: false,
					state: { pagination },
					onPaginationChange: (updater: Updater<PaginationState>) => {
						const next = resolveUpdater(updater, pagination);

						if (next.pageIndex !== pageIndex) {
							onPageChange(next.pageIndex + 1);
						}
					},
				}
			: { getPaginationRowModel: getPaginationRowModel() }),
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
