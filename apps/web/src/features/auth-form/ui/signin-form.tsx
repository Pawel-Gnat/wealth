import { zodResolver } from "@hookform/resolvers/zod";
import { type SignInPayload, signInPayloadSchema } from "@repo/api/schemas";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { Card, Form, FormInput, Text } from "@/shared/components";
import { useSignIn } from "../hooks/use-sign-in";

export function SigninForm() {
	const { t } = useTranslation();
	const { storeToken } = useAuth();
	const { signIn, isLoading } = useSignIn({
		onSuccess: (data) => {
			storeToken(data.data.token);
		},
		onError: () => {
			toast.error(t("toast.error.signed_in", { ns: "common" }));
		},
	});

	const form = useForm<SignInPayload>({
		resolver: zodResolver(signInPayloadSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	function onSubmit(data: SignInPayload) {
		signIn(data);
	}

	return (
		<Card
			header={
				<>
					<Text weight="medium">{t("signin.title", { ns: "auth" })}</Text>
					<Text size="sm">{t("signin.description", { ns: "auth" })}</Text>
				</>
			}
			content={
				<Form
					onSubmit={form.handleSubmit(onSubmit)}
					submitText={t("action.signin", { ns: "common" })}
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
				</Form>
			}
		/>
	);
}
