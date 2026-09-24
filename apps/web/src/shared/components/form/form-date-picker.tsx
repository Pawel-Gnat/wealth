import { format } from "date-fns";

import { Calendar } from "@/shared/lib/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/lib/ui/popover";
import { Button } from "../button";
import { Icon } from "../icons";
import { FormBase, type FormControlFunction } from "./form-base";

export const FormDatePicker: FormControlFunction = (props) => {
	return (
		<FormBase {...props}>
			{({ onChange, value, ...field }) => (
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="input" className="w-full" {...field}>
							<Icon name="calendar" />
							{format(value, "PPP")}
						</Button>
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
