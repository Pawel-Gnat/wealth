import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { IncomeForm } from "@/features/income-form";
import { useIncome } from "@/features/income-form/hooks/use-income";
import { Card, ErrorState, Heading } from "@/shared/components";
import { Skeleton } from "@/shared/lib/ui/skeleton";

export const IncomeFormPage = () => {
	const { t } = useTranslation();
	const { id } = useParams();
	const isEditMode = Boolean(id);
	const { data, isLoading, isError } = useIncome(id ? { incomeId: id } : {});

	if (isEditMode && isLoading) {
		return (
			<>
				<Heading>{t("single.title-edit", { ns: "incomes" })}</Heading>
				<Card content={<IncomeFormSkeleton />} />
			</>
		);
	}

	if (isEditMode && (isError || !data)) {
		return (
			<>
				<Heading>{t("single.title-edit", { ns: "incomes" })}</Heading>
				<Card
					content={<ErrorState text={t("list.error", { ns: "incomes" })} />}
				/>
			</>
		);
	}

	return (
		<>
			<Heading>
				{isEditMode
					? t("single.title-edit", { ns: "incomes" })
					: t("single.title-create", { ns: "incomes" })}
			</Heading>
			<Card
				content={
					<IncomeForm
						{...(id ? { incomeId: id } : {})}
						{...(data ? { initialValues: data } : {})}
					/>
				}
			/>
		</>
	);
};

const IncomeFormSkeleton = () => {
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
