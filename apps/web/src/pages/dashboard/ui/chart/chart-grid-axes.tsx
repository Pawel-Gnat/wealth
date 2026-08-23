import { CartesianGrid, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/shared/components/price/helpers/price.helpers";

type ChartGridAxesProps = {
	yAxisMax: number;
	language: string;
};

export const ChartGridAxes = ({ yAxisMax, language }: ChartGridAxesProps) => {
	return (
		<>
			<CartesianGrid vertical={false} />
			<XAxis
				dataKey="label"
				tickLine={false}
				axisLine={false}
				tickMargin={8}
				minTickGap={24}
			/>
			<YAxis
				domain={[0, yAxisMax]}
				tickCount={5}
				tickLine={false}
				axisLine={false}
				tickMargin={8}
				width={64}
				tickFormatter={(value) => formatPrice(Number(value), language)}
			/>
		</>
	);
};
