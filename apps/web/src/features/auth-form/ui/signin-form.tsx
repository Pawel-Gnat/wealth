import { zodResolver } from "@hookform/resolvers/zod";
import { type SignInPayload, signInPayloadSchema } from "@repo/api/schemas";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, Form, FormInput, Text } from "@/shared/components";
import { useSignIn } from "../hook/use-sign-in";

export function SigninForm() {
	const { t } = useTranslation();
	const { signIn, isLoading } = useSignIn();
	const form = useForm<SignInPayload>({
		resolver: zodResolver(signInPayloadSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: SignInPayload) {
		try {
			await signIn(data);
			toast.success(t("toast.success.signed_in", { ns: "common" }));
		} catch {
			toast.error(t("toast.error.signed_in", { ns: "common" }));
		}
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
					submitDisabled={isLoading}
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
