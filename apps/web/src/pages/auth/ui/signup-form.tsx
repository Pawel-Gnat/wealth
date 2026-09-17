import { useTranslation } from "react-i18next";
import { Form, FormInput } from "@/shared/components";
import { useSignUpForm } from "../hooks/use-sign-up-form";

type SignupFormProps = {
	onSignedUp: () => void;
};

export const SignupForm = ({ onSignedUp }: SignupFormProps) => {
	const { t } = useTranslation();
	const { control, isLoading, signUp } = useSignUpForm({ onSignedUp });

	return (
		<Form
			onSubmit={signUp}
			submitText={t("action.signup", { ns: "common" })}
			submitDisabled={isLoading}
			isLoading={isLoading}
		>
			<div className="grid sm:grid-cols-2 gap-4">
				<FormInput
					name="firstName"
					label={t("first-name.label", { ns: "form" })}
					placeholder={t("first-name.placeholder", { ns: "form" })}
					control={control}
					icon="user"
				/>
				<FormInput
					name="lastName"
					label={t("last-name.label", { ns: "form" })}
					placeholder={t("last-name.placeholder", { ns: "form" })}
					control={control}
					icon="user"
				/>
			</div>
			<FormInput
				name="email"
				label={t("email.label", { ns: "form" })}
				type="email"
				placeholder={t("email.placeholder", { ns: "form" })}
				control={control}
				icon="email"
			/>
			<FormInput
				name="password"
				label={t("password.label", { ns: "form" })}
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
	);
};
