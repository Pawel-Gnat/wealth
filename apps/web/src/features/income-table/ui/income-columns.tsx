import type { DocumentListItem } from "@repo/api/schemas";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Link } from "react-router";
import { APP_ROUTES } from "@/app/router";
import {
	ButtonDestructive,
	ButtonSecondary,
	Icon,
	Text,
	Tooltip,
} from "@/shared/components";
import { formatPrice } from "@/shared/helpers/price";

type IncomeColumnsProps = {
	t: TFunction<"common">;
	language: string;
	onDeleteIncome: (incomeId: string) => void;
	deletingIncomeId: string | null;
	isDeleting: boolean;
};

export const IncomeColumns = ({
	t,
	language,
	onDeleteIncome,
	deletingIncomeId,
	isDeleting,
}: IncomeColumnsProps): ColumnDef<DocumentListItem>[] => [
	{
		accessorKey: "date",
		header: () => (
			<Text size="sm" weight="medium">
				{t("common.date", { ns: "common" })}
			</Text>
		),
		cell: ({ row }) => {
			return (
				<Text size="sm">
					{new Date(row.original.date).toLocaleDateString(language)}
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
			return <Text size="sm">{formatPrice(amount, language)}</Text>;
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
			const editText = t("action.edit", { ns: "common" });
			const deleteText = t("action.delete", { ns: "common" });
			const isDisabled = deletingIncomeId === row.original.id || isDeleting;

			return (
				<div className="flex items-center gap-2 justify-end">
					<Tooltip
						trigger={
							<ButtonSecondary asChild size="icon">
								<Link to={APP_ROUTES.incomes.edit(row.original.id)}>
									<Icon name="edit" />
									<span className="sr-only">{editText}</span>
								</Link>
							</ButtonSecondary>
						}
						text={editText}
					/>
					<Tooltip
						trigger={
							<ButtonDestructive
								size="icon"
								onClick={() => onDeleteIncome(row.original.id)}
								disabled={isDisabled}
								isLoading={isDisabled}
							>
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
