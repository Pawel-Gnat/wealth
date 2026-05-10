import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { ExpenseForm } from "@/features/expense-form";
import { useExpense } from "@/features/expense-form/hooks/use-expense";
import { Card, ErrorState, Heading } from "@/shared/components";
import { Skeleton } from "@/shared/lib/ui/skeleton";

export const ExpenseFormPage = () => {
	const { t } = useTranslation();
	const { id } = useParams();
	const isEditMode = Boolean(id);
	const { data, isLoading, isError } = useExpense(id ? { expenseId: id } : {});

	if (isEditMode && isLoading) {
		return (
			<>
				<Heading>{t("single.title-edit", { ns: "expenses" })}</Heading>
				<Card content={<ExpenseFormSkeleton />} />
			</>
		);
	}

	if (isEditMode && (isError || !data)) {
		return (
			<>
				<Heading>{t("single.title-edit", { ns: "expenses" })}</Heading>
				<Card
					content={<ErrorState text={t("list.error", { ns: "expenses" })} />}
				/>
			</>
		);
	}

	return (
		<>
			<Heading>{t("single.title-create", { ns: "expenses" })}</Heading>
			<Card
				content={
					<ExpenseForm
						{...(id ? { expenseId: id } : {})}
						{...(data ? { initialValues: data } : {})}
					/>
				}
			/>
		</>
	);
};

const ExpenseFormSkeleton = () => {
	return (
		<div className="space-y-4">
			<Skeleton className="h-4 w-10" />
			<Skeleton className="h-9 w-full" />
			<Skeleton className="h-7 w-16" />
			<Skeleton className="h-0.5 w-full" />
			<Skeleton className="h-4 w-14" />
			<Skeleton className="h-40 w-full" />
		</div>
	);
};
