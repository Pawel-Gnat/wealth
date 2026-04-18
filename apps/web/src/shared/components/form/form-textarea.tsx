import { Textarea } from "@/shared/lib/ui/textarea";

import { FormBase, type FormControlFunction } from "./form-base";

export const FormTextarea: FormControlFunction = (props) => {
	return <FormBase {...props}>{(field) => <Textarea {...field} />}</FormBase>;
};
