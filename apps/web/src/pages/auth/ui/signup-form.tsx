import { zodResolver } from "@hookform/resolvers/zod";
import { type SignUpPayload, signUpPayloadSchema } from "@repo/api/schemas";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Form, FormInput } from "@/shared/components";
import { useSignUp } from "../hooks/use-sign-up";

type SignupFormProps = {
	onSignedUp: () => void;
};

export function SignupForm({ onSignedUp }: SignupFormProps) {
	const { t } = useTranslation();
	const { signUp, isLoading } = useSignUp({
		onSuccess: () => {
			toast.success(t("toast.success.account-created", { ns: "common" }));
			form.reset();
			onSignedUp();
		},
		onError: () => {
			toast.error(t("toast.error.account-created", { ns: "common" }));
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
				icon="email"
			/>
			<FormInput
				name="password"
				label={t("password.label", { ns: "form" })}
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
		</Form>
	);
}
