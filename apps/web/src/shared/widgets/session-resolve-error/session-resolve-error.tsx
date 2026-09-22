import { useTranslation } from "react-i18next";
import { Button, ErrorState } from "@/shared/components";

type SessionResolveErrorProps = {
	onRetry: () => void;
};

export const SessionResolveError = ({ onRetry }: SessionResolveErrorProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex h-svh w-full flex-col items-center justify-center gap-4 px-4">
			<ErrorState
				title={t("session.resolve-error.title", { ns: "auth" })}
				description={t("session.resolve-error.description", { ns: "auth" })}
			/>
			<Button onClick={onRetry}>{t("action.retry")}</Button>
		</div>
	);
};
