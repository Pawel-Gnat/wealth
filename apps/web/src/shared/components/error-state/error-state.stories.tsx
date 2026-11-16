import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { ErrorState } from "./error-state";

const ErrorStateStory = () => {
	const { t } = useTranslation();

	return (
		<ErrorState
			title={t("route-chunk-error.title", { ns: "common" })}
			description={t("route-chunk-error.description", { ns: "common" })}
		/>
	);
};

const meta = {
	title: "Shared/Error state",
	component: ErrorState,
	render: () => <ErrorStateStory />,
} satisfies Meta<typeof ErrorState>;

export default meta;

type Story = StoryObj;

export const WithError: Story = {
	name: "Error",
};
