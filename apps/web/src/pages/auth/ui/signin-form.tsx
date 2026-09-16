import { zodResolver } from "@hookform/resolvers/zod";
import { signInPayloadSchema } from "@repo/api/schemas";
import type { SignInPayload } from "@repo/api/types";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Form, FormInput } from "@/shared/components";
import { useSignIn } from "../hooks/use-sign-in";

export function SigninForm() {
	const { t } = useTranslation();
	const { signIn, isLoading } = useSignIn({
		onError: () => {
			toast.error(t("toast.error.signed-in", { ns: "common" }));
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
		</Form>
	);
}
