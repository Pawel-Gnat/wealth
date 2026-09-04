import {
	CalendarIcon,
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
	LoaderCircle,
	LogOut,
	Pencil,
	PlusCircle,
	Trash,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";

export const icons = {
	logout: LogOut,
	loader: LoaderCircle,
	dashboard: LayoutDashboard,
	income: TrendingUp,
	expense: TrendingDown,
	edit: Pencil,
	delete: Trash,
	add: PlusCircle,
	arrowLeft: ChevronLeft,
	arrowRight: ChevronRight,
	calendar: CalendarIcon,
	group: Users,
};

export type IconName = keyof typeof icons;
