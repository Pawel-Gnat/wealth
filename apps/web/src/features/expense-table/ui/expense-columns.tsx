import type { ExpenseDocumentListItem } from "@repo/api/schemas";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Link } from "react-router";
import {
	ButtonDestructive,
	ButtonSecondary,
	Icon,
	Text,
	Tooltip,
} from "@/shared/components";

type ExpenseColumnsProps = {
	t: TFunction<"common">;
	language: string;
};

export const ExpenseColumns = ({
	t,
	language,
}: ExpenseColumnsProps): ColumnDef<ExpenseDocumentListItem>[] => [
	{
		accessorKey: "slug",
		header: () => (
			<Text size="sm" weight="medium">
				ID
			</Text>
		),
		cell: ({ row }) => {
			return <Text size="sm">{row.original.slug}</Text>;
		},
	},
	{
		accessorKey: "createdAt",
		header: () => (
			<Text size="sm" weight="medium">
				{t("common.date", { ns: "common" })}
			</Text>
		),
		cell: ({ row }) => {
			return (
				<Text size="sm">
					{new Date(row.original.createdAt).toLocaleDateString(language)}
				</Text>
			);
		},
	},
	{
		accessorKey: "totalAmount",
		header: () => (
			<Text size="sm" weight="medium">
				{t("common.amount", { ns: "common" })}
			</Text>
		),
		cell: ({ row }) => {
			const amount = row.getValue<number>("totalAmount");
			const formatted = new Intl.NumberFormat(language, {
				style: "currency",
				currency: "USD",
			}).format(amount);

			return <Text size="sm">{formatted}</Text>;
		},
	},
	{
		accessorKey: "actions",
		header: () => (
			<Text size="sm" weight="medium" className="text-right">
				-
				<span className="sr-only">{t("common.actions", { ns: "common" })}</span>
			</Text>
		),
		cell: ({ row }) => {
			const editText = t("common.edit", { ns: "common" });
			const deleteText = t("common.delete", { ns: "common" });

			return (
				<div className="flex items-center gap-2 justify-end">
					<Tooltip
						trigger={
							<ButtonSecondary asChild size="icon">
								<Link to={`/expenses/${row.original.slug}`}>
									<Icon name="edit" />
									<span className="sr-only">{editText}</span>
								</Link>
							</ButtonSecondary>
						}
						text={editText}
					/>
					<Tooltip
						trigger={
							<ButtonDestructive size="icon">
								<Icon name="delete" />
								<span className="sr-only">{deleteText}</span>
							</ButtonDestructive>
						}
						text={deleteText}
					/>
				</div>
			);
		},
	},
];
