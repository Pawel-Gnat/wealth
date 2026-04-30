import {
	LayoutDashboard,
	LoaderCircle,
	TrendingDown,
	TrendingUp,
} from "lucide-react";

export const icons = {
	loader: LoaderCircle,
	dashboard: LayoutDashboard,
	income: TrendingUp,
	expense: TrendingDown,
};

export type IconName = keyof typeof icons;
