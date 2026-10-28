import { zodResolver } from "@hookform/resolvers/zod";
import { createUserPayloadSchema } from "@repo/api/schemas";
import type { CreateUserPayload, CreateUserResponse } from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useAppMutation } from "@/shared/hooks/use-app-mutation";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseSignUpFormProps = {
	onSignedUp: () => void;
};

export const useSignUpForm = ({ onSignedUp }: UseSignUpFormProps) => {
	const { t } = useTranslation();
	const form = useForm<CreateUserPayload>({
		resolver: zodResolver(createUserPayloadSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			firstName: "",
			lastName: "",
		},
	});

	const mutation = useAppMutation<CreateUserResponse, Error, CreateUserPayload>(
		{
			mutationFn: (payload) =>
				runWithRequestId(async () => {
					return await controlledAsync(() => orpcClient.user.signUp(payload));
				}),
			onSuccess: () => {
				form.reset();
				toast.success(t("toast.success.account-created", { ns: "common" }));
				onSignedUp();
			},
			onError: () => {
				toast.error(t("toast.error.account-created", { ns: "common" }));
			},
		},
	);

	return {
		control: form.control,
		isPending: mutation.isPending,
		signUp: form.handleSubmit((payload) => mutation.mutate(payload)),
	};
};
