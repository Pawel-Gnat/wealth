import { Text, type TextProps } from "../typography";
import { formatPrice } from "./helpers/price.helpers";

export type PriceProps = Omit<TextProps, "children"> & {
	amount: number;
	language: string;
};

export const Price = ({ amount, language, ...props }: PriceProps) => {
	return <Text {...props}>{formatPrice(amount, language)}</Text>;
};
