import {
	CalendarIcon,
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
	LoaderCircle,
	LogOut,
	Pencil,
	Plus,
	Trash,
	TrendingDown,
	TrendingUp,
} from "lucide-react";

export const icons = {
	logout: LogOut,
	loader: LoaderCircle,
	dashboard: LayoutDashboard,
	income: TrendingUp,
	expense: TrendingDown,
	edit: Pencil,
	delete: Trash,
	add: Plus,
	arrowLeft: ChevronLeft,
	arrowRight: ChevronRight,
	calendar: CalendarIcon,
};

export type IconName = keyof typeof icons;
