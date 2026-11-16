import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormSearch } from "./form-search";

const SearchField = () => {
	const { t } = useTranslation();
	const [search, setSearch] = useState("");

	return (
		<FormSearch
			search={search}
			onSearchChange={setSearch}
			label={t("search.label", { ns: "form" })}
			placeholder={t("members.search.placeholder", { ns: "budgets" })}
			icon="search"
		/>
	);
};

const meta = {
	title: "Shared/Form/Search",
	component: FormSearch,
	render: () => <SearchField />,
} satisfies Meta<typeof FormSearch>;

export default meta;

type Story = StoryObj;

export const Idle: Story = {};
