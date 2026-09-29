import type { ReactNode } from "react";
import { useId } from "react";
import { Field, FieldLabel } from "@/shared/lib/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/shared/lib/ui/input-group";
import { Icon, type IconName } from "../icons";

type FormSearchProps = {
	search: string;
	onSearchChange: (search: string) => void;
	label: ReactNode;
	placeholder?: string;
	icon?: IconName;
};

export const FormSearch = ({
	search,
	onSearchChange,
	label,
	placeholder,
	icon,
}: FormSearchProps) => {
	const id = useId();

	return (
		<Field>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<InputGroup>
				{icon && (
					<InputGroupAddon>
						<Icon name={icon} />
					</InputGroupAddon>
				)}
				<InputGroupInput
					id={id}
					value={search}
					placeholder={placeholder}
					onChange={(event) => onSearchChange(event.target.value)}
				/>
			</InputGroup>
		</Field>
	);
};
