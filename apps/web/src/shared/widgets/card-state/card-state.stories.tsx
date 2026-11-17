import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { Text } from "@/shared/components";
import { CardState } from "./card-state";

type Summary = {
	amount: string;
};

const summary: Summary = {
	amount: "123.45",
};

const CardStateStory = ({
	data,
	isLoading = false,
	isError = false,
	empty = false,
}: {
	data: Summary | Summary[] | null;
	isLoading?: boolean;
	isError?: boolean;
	empty?: boolean;
}) => {
	const { t } = useTranslation();
	const emptyProps = empty
		? {
				emptyTitle: t("list.empty.title", { ns: "records" }),
				emptyDescription: t("list.empty.description", { ns: "records" }),
				emptyIcon: "money" as const,
			}
		: {};

	return (
		<CardState
			title={t("list.title", { ns: "records" })}
			subtitle={t("list.subtitle", { ns: "records" })}
			data={data}
			isLoading={isLoading}
			isError={isError}
			errorTitle={t("list.error.title", { ns: "records" })}
			errorDescription={t("list.error.description", { ns: "records" })}
			skeletonClassName="h-14 w-full"
			{...emptyProps}
		>
			{(value) =>
				Array.isArray(value) ? null : (
					<Text weight="medium">{value.amount}</Text>
				)
			}
		</CardState>
	);
};

const meta = {
	title: "Widgets/Card state",
	component: CardState,
} satisfies Meta<typeof CardState>;

export default meta;

type Story = StoryObj;

export const Loading: Story = {
	render: () => <CardStateStory data={null} isLoading />,
};

export const WithError: Story = {
	name: "Error",
	render: () => <CardStateStory data={null} isError />,
};

export const Empty: Story = {
	render: () => <CardStateStory data={[]} empty />,
};

export const WithData: Story = {
	render: () => <CardStateStory data={summary} />,
};
