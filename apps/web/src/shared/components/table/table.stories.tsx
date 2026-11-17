import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Table } from "./table";

type Row = {
	item: string;
	amount: string;
};

const rows: Row[] = [
	{
		item: "Taxi",
		amount: "123.45",
	},
];

const TableStory = ({
	isLoading,
	data,
}: {
	isLoading: boolean;
	data: Row[];
}) => {
	const { t } = useTranslation();
	const columns: ColumnDef<Row>[] = [
		{
			accessorKey: "item",
			header: t("common.item", { ns: "common" }),
		},
		{
			accessorKey: "amount",
			header: t("common.amount", { ns: "common" }),
		},
	];

	return (
		<Table
			columns={columns}
			data={data}
			isLoading={isLoading}
			noResultsIcon="money"
			noResultsTitle={t("list.empty.title", { ns: "records" })}
			noResultsDescription={t("list.empty.description", { ns: "records" })}
		/>
	);
};

const meta = {
	title: "Shared/Table",
	component: Table,
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj;

export const Loading: Story = {
	render: () => <TableStory isLoading data={[]} />,
};

export const Empty: Story = {
	render: () => <TableStory isLoading={false} data={[]} />,
};

export const WithData: Story = {
	render: () => <TableStory isLoading={false} data={rows} />,
};
