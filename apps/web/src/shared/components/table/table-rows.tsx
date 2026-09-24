import { flexRender, type Table } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/shared/lib/ui/table";

type DataTableRowsProps<TData> = {
	table: Table<TData>;
};

export const DataTableRows = <TData,>({ table }: DataTableRowsProps<TData>) => {
	return table.getRowModel().rows.map((row) => (
		<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
			{row.getVisibleCells().map((cell) => (
				<TableCell
					key={cell.id}
					className={cell.column.columnDef.meta?.className}
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	));
};
