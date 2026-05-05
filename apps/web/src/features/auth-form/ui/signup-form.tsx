import { zodResolver } from "@hookform/resolvers/zod";
import { type SignUpPayload, signUpPayloadSchema } from "@repo/api/schemas";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, Form, FormInput, Text } from "@/shared/components";
import { useSignUp } from "../hooks/use-sign-up";

type SignupFormProps = {
	onSignedUp: () => void;
};

export function SignupForm({ onSignedUp }: SignupFormProps) {
	const { t } = useTranslation();
	const { signUp, isLoading } = useSignUp({
		onSuccess: () => {
			toast.success(t("toast.success.account_created", { ns: "common" }));
			form.reset();
			onSignedUp();
		},
		onError: () => {
			toast.error(t("toast.error.account_created", { ns: "common" }));
		},
	});

	const form = useForm<SignUpPayload>({
		resolver: zodResolver(signUpPayloadSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	function onSubmit(data: SignUpPayload) {
		signUp(data);
	}

	return (
		<Card
			header={
				<>
					<Text weight="medium">{t("signup.title", { ns: "auth" })}</Text>
					<Text size="sm">{t("signup.description", { ns: "auth" })}</Text>
				</>
			}
			content={
				<Form
					onSubmit={form.handleSubmit(onSubmit)}
					submitText={t("action.signup", { ns: "common" })}
					submitDisabled={isLoading}
					isLoading={isLoading}
				>
					<FormInput
						name="email"
						label={t("email.label", { ns: "form" })}
						type="email"
						placeholder={t("email.placeholder", { ns: "form" })}
						control={form.control}
					/>
					<FormInput
						name="password"
						label={t("password.label", { ns: "form" })}
						type="password"
						placeholder={t("password.placeholder", { ns: "form" })}
						control={form.control}
					/>
					<FormInput
						name="confirmPassword"
						label={t("confirm-password.label", { ns: "form" })}
						type="password"
						placeholder={t("password.placeholder", { ns: "form" })}
						control={form.control}
					/>
				</Form>
			}
		/>
	);
}
