import { flexRender, type Table } from "@tanstack/react-table";
import { TableHead, TableHeader, TableRow } from "@/shared/lib/ui/table";

type DataTableHeaderProps<TData> = {
	table: Table<TData>;
};

export const DataTableHeader = <TData,>({
	table,
}: DataTableHeaderProps<TData>) => {
	return (
		<TableHeader className="bg-muted">
			{table.getHeaderGroups().map((headerGroup) => (
				<TableRow key={headerGroup.id}>
					{headerGroup.headers.map((header) => (
						<TableHead
							key={header.id}
							className={header.column.columnDef.meta?.className}
						>
							{header.isPlaceholder
								? null
								: flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
						</TableHead>
					))}
				</TableRow>
			))}
		</TableHeader>
	);
};
