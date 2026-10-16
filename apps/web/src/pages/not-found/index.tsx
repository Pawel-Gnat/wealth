import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { Button, ErrorState } from "@/shared/components";

export const NotFoundPage = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center justify-center gap-4 px-4 py-16 m-auto">
			<ErrorState
				title={t("not-found.title")}
				description={t("not-found.description")}
			/>
			<Button variant="link" asChild>
				<Link to={APP_ROUTES.dashboard} className="text-primary-foreground">
					{t("not-found.back-home")}
				</Link>
			</Button>
		</div>
	);
};
