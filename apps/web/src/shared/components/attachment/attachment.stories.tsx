import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { Attachment } from "./attachment";

const AttachmentStory = () => {
	const { t } = useTranslation();

	return (
		<Attachment
			title={t("file.label", { ns: "form" })}
			description={t("file.description", { ns: "form", size: 5 })}
			onRemove={() => undefined}
		/>
	);
};

const meta = {
	title: "Shared/Attachment",
	component: Attachment,
	render: () => <AttachmentStory />,
} satisfies Meta<typeof Attachment>;

export default meta;

type Story = StoryObj;

export const Default: Story = {};
