import { useTranslation } from "react-i18next";
import { Form, FormInput } from "@/shared/components";
import { useSignInForm } from "../hooks/use-sign-in-form";

export const SigninForm = () => {
	const { t } = useTranslation();
	const { control, isPending, signIn } = useSignInForm();

	return (
		<Form
			onSubmit={signIn}
			submitText={t("action.signin", { ns: "common" })}
			isPending={isPending}
		>
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
		</Form>
	);
};
