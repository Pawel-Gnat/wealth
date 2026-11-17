import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { Button } from "../button";
import { Card } from "./card";

const CardStory = () => {
	const { t } = useTranslation();

	return (
		<Card
			title={t("list.title", { ns: "records" })}
			subtitle={t("list.subtitle", { ns: "records" })}
			actions={
				<Button size="sm" type="button">
					{t("action.add", { ns: "common" })}
				</Button>
			}
		>
			{t("list.empty.description", { ns: "records" })}
		</Card>
	);
};

const meta = {
	title: "Shared/Card",
	component: Card,
	render: () => <CardStory />,
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj;

export const Default: Story = {};
