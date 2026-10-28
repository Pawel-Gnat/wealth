import { zodResolver } from "@hookform/resolvers/zod";
import { userEditPasswordSchema } from "@repo/api/schemas";
import type {
	UserEditPasswordPayload,
	UserEditPasswordResponse,
} from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useAppMutation } from "@/shared/hooks/use-app-mutation";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

export const usePasswordForm = () => {
	const { t } = useTranslation();
	const form = useForm<UserEditPasswordPayload>({
		resolver: zodResolver(userEditPasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const mutation = useAppMutation<
		UserEditPasswordResponse,
		Error,
		UserEditPasswordPayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				return await controlledAsync(() =>
					orpcClient.settings.password(payload),
				);
			}),
		onSuccess: () => {
			form.reset();
			toast.success(t("toast.success.password-updated", { ns: "common" }));
		},
		onError: () => {
			toast.error(t("toast.error.password-updated", { ns: "common" }));
		},
	});

	return {
		control: form.control,
		isPending: mutation.isPending,
		updatePassword: form.handleSubmit((payload) => mutation.mutate(payload)),
	};
};
