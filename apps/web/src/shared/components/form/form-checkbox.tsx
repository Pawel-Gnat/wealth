import { Checkbox } from "@/shared/lib/ui/checkbox";
import { FormBase, type FormControlFunction } from "./form-base";

export const FormCheckbox: FormControlFunction = (props) => {
	return (
		<FormBase {...props}>
			{({ onChange, value, ...field }) => (
				<Checkbox {...field} checked={value} onCheckedChange={onChange} />
			)}
		</FormBase>
	);
};
