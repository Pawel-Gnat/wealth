import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/tailwind/utils";
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

const GROUP_CLASS_NAME = "rounded-full bg-muted p-1 gap-1";
const ITEM_CLASS_NAME = cn(
	"rounded-full border-0 bg-transparent shadow-none text-muted-foreground",
	"hover:bg-transparent hover:text-foreground",
	"data-[state=on]:bg-background data-[state=on]:text-foreground",
	"group-data-[spacing=0]/toggle-group:rounded-full",
	"group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-full",
	"group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-full",
	"group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-full",
	"group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-full",
);

const renderItems = (items: ToggleGroupOption[]) =>
	items.map(({ value, content, ariaLabel, disabled }) => (
		<ToggleGroupItemUI
			key={value}
			value={value}
			aria-label={ariaLabel}
			disabled={disabled}
			className={ITEM_CLASS_NAME}
		>
			{content}
		</ToggleGroupItemUI>
	));

export const ToggleGroup = (props: ToggleGroupProps) => {
	if (props.type === "multiple") {
		const { items, type: _type, className, ...toggleGroupProps } = props;

		return (
			<ToggleGroupUI
				type="multiple"
				spacing={1}
				size="sm"
				{...toggleGroupProps}
				className={cn(GROUP_CLASS_NAME, className)}
			>
				{renderItems(items)}
			</ToggleGroupUI>
		);
	}

	const { items, type: _type, className, ...toggleGroupProps } = props;

	return (
		<ToggleGroupUI
			type="single"
			spacing={1}
			size="sm"
			{...toggleGroupProps}
			className={cn(GROUP_CLASS_NAME, className)}
		>
			{renderItems(items)}
		</ToggleGroupUI>
	);
};

export { ToggleGroupItemUI as ToggleGroupItem };
