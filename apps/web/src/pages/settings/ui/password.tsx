import { useTranslation } from "react-i18next";
import { ButtonPrimary, Card, FormInput } from "@/shared/components";
import { usePasswordForm } from "../hooks/use-password-form";

export const Password = () => {
	const { t } = useTranslation();
	const form = usePasswordForm();
	const passwordLabel = t("password.label", { ns: "form" });

	return (
		<Card title={t("password.title", { ns: "settings" })}>
			<form
				onSubmit={form.handleSubmit(() => undefined)}
				className="flex flex-col gap-4"
			>
				<FormInput
					name="currentPassword"
					label={t("password.current", {
						ns: "settings",
						label: passwordLabel,
					})}
					type="password"
					placeholder={t("password.placeholder", { ns: "form" })}
					control={form.control}
					icon="password"
				/>
				<FormInput
					name="newPassword"
					label={t("password.new", { ns: "settings", label: passwordLabel })}
					type="password"
					placeholder={t("password.placeholder", { ns: "form" })}
					control={form.control}
					icon="password"
				/>
				<FormInput
					name="confirmPassword"
					label={t("confirm-password.label", { ns: "form" })}
					type="password"
					placeholder={t("password.placeholder", { ns: "form" })}
					control={form.control}
					icon="password"
				/>
				<ButtonPrimary className="w-fit ml-auto">
					{t("action.update", { ns: "common" })}
				</ButtonPrimary>
			</form>
		</Card>
	);
};
