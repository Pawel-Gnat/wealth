import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Toaster, toast } from "./toast";

const SuccessToast = () => {
	const { t } = useTranslation();

	useEffect(() => {
		const id = toast.success(
			t("toast.success.details-updated", { ns: "common" }),
			{ duration: Infinity },
		);

		return () => {
			toast.dismiss(id);
		};
	}, [t]);

	return null;
};

const ErrorToast = () => {
	const { t } = useTranslation();

	useEffect(() => {
		const id = toast.error(t("toast.error.details-updated", { ns: "common" }), {
			duration: Infinity,
		});

		return () => {
			toast.dismiss(id);
		};
	}, [t]);

	return null;
};

const InfoToast = () => {
	const { t } = useTranslation();

	useEffect(() => {
		const id = toast.info(
			t("toast.success.notifications-updated", { ns: "common" }),
			{ duration: Infinity },
		);

		return () => {
			toast.dismiss(id);
		};
	}, [t]);

	return null;
};

const WarningToast = () => {
	const { t } = useTranslation();

	useEffect(() => {
		const id = toast.warning(
			t("toast.error.too-many-requests", { ns: "common", count: 30 }),
			{ duration: Infinity },
		);

		return () => {
			toast.dismiss(id);
		};
	}, [t]);

	return null;
};

const LoadingToast = () => {
	const { t } = useTranslation();

	useEffect(() => {
		const id = toast.loading(t("common.loading", { ns: "common" }), {
			duration: Infinity,
		});

		return () => {
			toast.dismiss(id);
		};
	}, [t]);

	return null;
};

const meta = {
	title: "Shared/Toast",
	component: Toaster,
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
	render: () => <SuccessToast />,
};

export const WithError: Story = {
	name: "Error",
	render: () => <ErrorToast />,
};

export const Info: Story = {
	render: () => <InfoToast />,
};

export const Warning: Story = {
	render: () => <WarningToast />,
};

export const Loading: Story = {
	render: () => <LoadingToast />,
};
