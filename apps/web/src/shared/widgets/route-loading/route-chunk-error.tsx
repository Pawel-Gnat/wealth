import { useTranslation } from "react-i18next";
import { Button, ErrorState } from "@/shared/components";

export const RouteChunkError = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
			<ErrorState
				title={t("route-chunk-error.title")}
				description={t("route-chunk-error.description")}
			/>
			<Button onClick={() => window.location.reload()}>
				{t("action.refresh")}
			</Button>
		</div>
	);
};
