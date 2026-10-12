import type { RecordKind } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Form } from "@/shared/components";
import {
	type RecordFormValues,
	useUpsertRecord,
} from "../hooks/use-upsert-record";
import { RecordFields } from "./record-fields";

export type RecordFormProps = {
	kind?: RecordKind;
	recordId?: string;
	initialValues?: RecordFormValues;
};

export const RecordForm = ({
	kind,
	recordId,
	initialValues,
}: RecordFormProps) => {
	const { t } = useTranslation();
	const { form, isPending, isEditMode, onSubmit } = useUpsertRecord({
		...(kind ? { kind } : {}),
		...(recordId ? { recordId } : {}),
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
