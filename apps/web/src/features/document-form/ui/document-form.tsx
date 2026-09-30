import { useTranslation } from "react-i18next";
import type { RecordKind } from "@/features/model/record-kind";
import { Form } from "@/shared/components";
import {
	type RecordFormValues,
	useUpsertDocument,
} from "../hooks/use-upsert-document";
import { DocumentFields } from "./document-fields";

export type DocumentFormProps = {
	kind?: RecordKind;
	documentId?: string;
	initialValues?: RecordFormValues;
};

export const DocumentForm = ({
	kind,
	documentId,
	initialValues,
}: DocumentFormProps) => {
	const { t } = useTranslation();
	const { form, isPending, isEditMode, onSubmit } = useUpsertDocument({
		...(kind ? { kind } : {}),
		...(documentId ? { documentId } : {}),
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
			<DocumentFields form={form} isKindLocked={isEditMode} />
		</Form>
	);
};
