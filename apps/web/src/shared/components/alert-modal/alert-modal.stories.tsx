import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { AlertModal } from "./alert-modal";
import { AlertModalSkeleton } from "./alert-modal-skeleton";

const AlertModalStory = ({ isConfirming }: { isConfirming?: boolean }) => {
	const { t } = useTranslation();

	return (
		<AlertModal
			open
			onOpenChange={() => undefined}
			title={t("delete.expense.title", { ns: "records" })}
			description={t("delete.expense.description", { ns: "records" })}
			cancelText={t("action.cancel", { ns: "common" })}
			confirmText={t("action.delete", { ns: "common" })}
			onConfirm={() => undefined}
			{...(isConfirming ? { isConfirming } : {})}
		/>
	);
};

const meta = {
	title: "Shared/Alert modal",
	component: AlertModal,
} satisfies Meta<typeof AlertModal>;

export default meta;

type Story = StoryObj;

export const Open: Story = {
	render: () => <AlertModalStory />,
};

export const Confirming: Story = {
	render: () => <AlertModalStory isConfirming />,
};

export const Skeleton: Story = {
	render: () => <AlertModalSkeleton onClose={() => undefined} />,
};
