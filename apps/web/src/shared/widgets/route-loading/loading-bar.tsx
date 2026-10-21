import { useTranslation } from "react-i18next";
import { useLoader } from "@/shared/hooks/use-loader";

type LoadingBarProps = {
	isLoading: boolean;
};

export const LoadingBar = ({ isLoading }: LoadingBarProps) => {
	const { t } = useTranslation();
	const visible = useLoader({ isLoading });

	if (!visible) {
		return null;
	}

	return (
		<div
			aria-label={t("common.loading", { ns: "common" })}
			aria-live="polite"
			className="pointer-events-none fixed inset-x-0 top-0 z-50 h-2 overflow-hidden"
			role="progressbar"
		>
			<div className="h-full w-1/3 bg-primary motion-safe:animate-route-loading motion-reduce:w-full" />
		</div>
	);
};
