import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { Empty as EmptyView } from "./empty";

const EmptyStory = () => {
	const { t } = useTranslation();

	return (
		<EmptyView
			icon="money"
			title={t("list.empty.title", { ns: "records" })}
			description={t("list.empty.description", { ns: "records" })}
		/>
	);
};

const meta = {
	title: "Shared/Empty",
	component: EmptyView,
	render: () => <EmptyStory />,
} satisfies Meta<typeof EmptyView>;

export default meta;

type Story = StoryObj;

export const Empty: Story = {};
