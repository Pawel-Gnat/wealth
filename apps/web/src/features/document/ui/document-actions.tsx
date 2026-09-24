import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button, Icon, Skeleton } from "@/shared/components";

type DocumentActionsProps = {
	editPath: string;
	isLoading: boolean;
	isReady: boolean;
	onDelete: () => void;
};

export const DocumentActions = ({
	editPath,
	isLoading,
	isReady,
	onDelete,
}: DocumentActionsProps) => {
	const { t } = useTranslation();

	if (isReady) {
		return (
			<div className="flex items-center gap-2">
				<Button variant="secondary" asChild>
					<Link to={editPath}>
						<Icon name="edit" />
						{t("action.edit", { ns: "common" })}
					</Link>
				</Button>
				<Button variant="destructive" onClick={onDelete}>
					<Icon name="delete" />
					{t("action.delete", { ns: "common" })}
				</Button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center gap-2">
				<Skeleton className="h-9 w-20" />
				<Skeleton className="h-9 w-24" />
			</div>
		);
	}

	return null;
};
