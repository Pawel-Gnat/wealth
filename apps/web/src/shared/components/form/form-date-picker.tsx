import { format } from "date-fns";

import { Calendar } from "@/shared/lib/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/lib/ui/popover";
import { ButtonInput } from "../button/button";
import { Icon } from "../icons";
import { FormBase, type FormControlFunction } from "./form-base";

export const FormDatePicker: FormControlFunction = (props) => {
	return (
		<FormBase {...props}>
			{({ onChange, value, ...field }) => (
				<Popover>
					<PopoverTrigger asChild>
						<ButtonInput className="w-full" {...field}>
							<Icon name="calendar" />
							{format(value, "PPP")}
						</ButtonInput>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							required
							selected={value}
							onSelect={(selected) => {
								onChange(selected);
							}}
						/>
					</PopoverContent>
				</Popover>
			)}
		</FormBase>
	);
};
