import type { RecordType } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Form } from "@/shared/components";
import {
	type RecordFormValues,
	useUpsertRecord,
} from "../hooks/use-upsert-record";
import { RecordFields } from "./record-fields";

export type RecordFormProps = {
	type?: RecordType;
	recordId?: string;
	budgetId?: string;
	initialValues?: RecordFormValues;
};

export const RecordForm = ({
	type,
	recordId,
	budgetId,
	initialValues,
}: RecordFormProps) => {
	const { t } = useTranslation();
	const { form, isPending, isEditMode, onSubmit } = useUpsertRecord({
		...(type ? { type } : {}),
		...(recordId ? { recordId } : {}),
		...(budgetId ? { budgetId } : {}),
		...(initialValues ? { initialValues } : {}),
	});

	return (
		<Form
			onSubmit={onSubmit}
			submitText={t(isEditMode ? "action.save" : "action.create", {
				ns: "common",
			})}
			isPending={isPending}
		>
			<RecordFields form={form} isKindLocked={isEditMode} />
		</Form>
	);
};
