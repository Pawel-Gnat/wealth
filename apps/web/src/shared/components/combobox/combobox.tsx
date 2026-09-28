import { useTranslation } from "react-i18next";
import {
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	Combobox as ComboboxUI,
} from "@/shared/lib/ui/combobox";

type ComboboxProps = {
	data: string[];
	placeholder: string;
};

export const Combobox = ({ data, placeholder }: ComboboxProps) => {
	const { t } = useTranslation();

	return (
		<ComboboxUI items={data}>
			<ComboboxInput placeholder={placeholder} />
			<ComboboxContent>
				<ComboboxEmpty>{t("search.empty", { ns: "form" })}</ComboboxEmpty>
				<ComboboxList>
					{(item) => (
						<ComboboxItem key={item} value={item}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</ComboboxUI>
	);
};
