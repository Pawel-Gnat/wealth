import { zodResolver } from "@hookform/resolvers/zod";
import { type SignInPayload, signInPayloadSchema } from "@repo/api/schemas";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { Card, Form, FormInput, Text } from "@/shared/components";

export function SigninForm() {
	const { t } = useTranslation();
	const { login } = useAuth();
	const form = useForm<SignInPayload>({
		resolver: zodResolver(signInPayloadSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	function onSubmit(_data: SignInPayload) {
		// Replace with API sign-in; token from response.
		login("stub-token");
		toast.success(t("toast.success.signed_in", { ns: "common" }));
	}

	return (
		<Card
			header={
				<>
					<Text>{t("signin.title", { ns: "auth" })}</Text>
					<Text size="sm">{t("signin.description", { ns: "auth" })}</Text>
				</>
			}
			content={
				<Form
					onSubmit={form.handleSubmit(onSubmit)}
					submitText={t("action.signin", { ns: "common" })}
				>
					<FormInput
						name="email"
						label={t("email.label", { ns: "form" })}
						type="email"
						control={form.control}
					/>

					<FormInput
						name="password"
						label={t("password.label", { ns: "form" })}
						type="password"
						control={form.control}
					/>
				</Form>
			}
		/>
	);
}
