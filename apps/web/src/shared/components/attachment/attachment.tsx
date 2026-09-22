import { cn } from "cn";
import { useTranslation } from "react-i18next";
import {
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentTitle,
	Attachment as AttachmentUI,
} from "@/shared/lib/ui/attachment";
import { Button } from "../button";
import { Icon } from "../icons";

type AttachmentProps = {
	title: string;
	description?: string;
	onRemove: () => void;
} & React.ComponentProps<typeof AttachmentUI>;

export const Attachment = ({
	title,
	description,
	onRemove,
	className,
	...props
}: AttachmentProps) => {
	const { t } = useTranslation();

	return (
		<AttachmentUI
			{...props}
			className={cn(
				"grid w-full grid-cols-[auto_minmax(0,1fr)_auto]",
				className,
			)}
		>
			<AttachmentMedia>
				<Icon name="fileImage" />
			</AttachmentMedia>
			<AttachmentContent>
				<AttachmentTitle>{title}</AttachmentTitle>
				{description && (
					<AttachmentDescription>{description}</AttachmentDescription>
				)}
			</AttachmentContent>
			<AttachmentActions>
				<Button
					variant="input"
					size="icon"
					aria-label={t("action.remove", { ns: "common", fileName: title })}
					onClick={onRemove}
				>
					<Icon name="delete" />
				</Button>
			</AttachmentActions>
		</AttachmentUI>
	);
};
