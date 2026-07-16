import type { ComponentProps, ReactNode } from "react";
import {
	ToggleGroupItem as ToggleGroupItemUI,
	ToggleGroup as ToggleGroupUI,
} from "@/shared/lib/ui/toggle-group";

export type ToggleGroupOption = {
	value: string;
	content: ReactNode;
	ariaLabel?: string;
	disabled?: boolean;
};

type ToggleGroupStyleProps = Pick<
	ComponentProps<typeof ToggleGroupUI>,
	"variant" | "size" | "className" | "spacing" | "orientation" | "disabled"
>;

type ToggleGroupCommonProps = {
	items: ToggleGroupOption[];
} & ToggleGroupStyleProps;

type ToggleGroupByType = {
	single: {
		type?: "single";
		value?: string;
		defaultValue?: string;
		onValueChange?: (value: string) => void;
	};
	multiple: {
		type: "multiple";
		value?: string[];
		defaultValue?: string[];
		onValueChange?: (value: string[]) => void;
	};
};

export type ToggleGroupSingleProps = ToggleGroupCommonProps &
	ToggleGroupByType["single"];

export type ToggleGroupMultipleProps = ToggleGroupCommonProps &
	ToggleGroupByType["multiple"];

export type ToggleGroupProps =
	| ToggleGroupSingleProps
	| ToggleGroupMultipleProps;

const renderItems = (items: ToggleGroupOption[]) =>
	items.map(({ value, content, ariaLabel, disabled }) => (
		<ToggleGroupItemUI
			key={value}
			value={value}
			aria-label={ariaLabel}
			disabled={disabled}
		>
			{content}
		</ToggleGroupItemUI>
	));

export const ToggleGroup = (props: ToggleGroupProps) => {
	if (props.type === "multiple") {
		const { items, type: _type, ...toggleGroupProps } = props;

		return (
			<ToggleGroupUI type="multiple" {...toggleGroupProps}>
				{renderItems(items)}
			</ToggleGroupUI>
		);
	}

	const { items, type: _type, ...toggleGroupProps } = props;

	return (
		<ToggleGroupUI type="single" {...toggleGroupProps}>
			{renderItems(items)}
		</ToggleGroupUI>
	);
};

export { ToggleGroupItemUI as ToggleGroupItem };
