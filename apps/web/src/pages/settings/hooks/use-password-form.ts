import { zodResolver } from "@hookform/resolvers/zod";
import { userEditPasswordSchema } from "@repo/api/schemas";
import type {
	UserEditPasswordPayload,
	UserEditPasswordResponse,
} from "@repo/api/types";
import {
	AUTH_OBSERVABILITY_EVENTS,
	logger,
	runWithRequestId,
} from "@repo/observability/browser";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
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

	const mutation = useMutation<
		UserEditPasswordResponse,
		Error,
		UserEditPasswordPayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				const data = await controlledAsync(() =>
					orpcClient.settings.password(payload),
				);
				logger.info(AUTH_OBSERVABILITY_EVENTS.passwordUpdateSucceeded);
				return data;
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
