import { useTranslation } from "react-i18next";
import { Card, Form, FormInput } from "@/shared/components";
import { usePasswordForm } from "../hooks/use-password-form";

export const Password = () => {
	const { t } = useTranslation();
	const { control, isLoading, updatePassword } = usePasswordForm();
	const passwordLabel = t("password.label", { ns: "form" });

	return (
		<Card title={t("password.title", { ns: "settings" })}>
			<Form
				onSubmit={updatePassword}
				submitText={t("action.update", { ns: "common" })}
				submitDisabled={isLoading}
				isLoading={isLoading}
			>
				<FormInput
					name="currentPassword"
					label={t("password.current", {
						ns: "settings",
						label: passwordLabel,
					})}
					type="password"
					placeholder={t("password.placeholder", { ns: "form" })}
					control={control}
					icon="password"
				/>
				<FormInput
					name="newPassword"
					label={t("password.new", { ns: "settings", label: passwordLabel })}
					type="password"
					placeholder={t("password.placeholder", { ns: "form" })}
					control={control}
					icon="password"
				/>
				<FormInput
					name="confirmPassword"
					label={t("confirm-password.label", { ns: "form" })}
					type="password"
					placeholder={t("password.placeholder", { ns: "form" })}
					control={control}
					icon="password"
				/>
			</Form>
		</Card>
	);
};
