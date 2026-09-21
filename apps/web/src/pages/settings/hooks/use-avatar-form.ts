import { zodResolver } from "@hookform/resolvers/zod";
import { userEditAvatarSchema } from "@repo/api/schemas";
import type {
	UserEditAvatarPayload,
	UserEditAvatarResponse,
} from "@repo/api/types";
import {
	AUTH_OBSERVABILITY_EVENTS,
	logger,
	runWithRequestId,
} from "@repo/observability/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type UseAvatarFormProps = {
	onSuccess?: () => void;
};

export const useAvatarForm = ({ onSuccess }: UseAvatarFormProps = {}) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const form = useForm<UserEditAvatarPayload>({
		resolver: zodResolver(userEditAvatarSchema),
	});

	const avatar = useWatch({ control: form.control, name: "avatar" });
	const previewSrc = useMemo(() => {
		if (
			!(avatar instanceof File) ||
			typeof URL.createObjectURL !== "function"
		) {
			return null;
		}

		return URL.createObjectURL(avatar);
	}, [avatar]);

	useEffect(() => {
		return () => {
			if (previewSrc) {
				URL.revokeObjectURL(previewSrc);
			}
		};
	}, [previewSrc]);

	const mutation = useMutation<
		UserEditAvatarResponse,
		Error,
		UserEditAvatarPayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				const data = await controlledAsync(() =>
					orpcClient.settings.avatar(payload),
				);
				logger.info(AUTH_OBSERVABILITY_EVENTS.avatarUpdateSucceeded);
				return data;
			}),
		onSuccess: () => {
			form.reset();
			void queryClient.invalidateQueries({ queryKey: queryKeys.me() });
			toast.success(t("toast.success.avatar-updated", { ns: "common" }));
			onSuccess?.();
		},
		onError: () => {
			toast.error(t("toast.error.avatar-updated", { ns: "common" }));
		},
	});

	return {
		control: form.control,
		isPending: mutation.isPending,
		updateAvatar: form.handleSubmit((payload) => mutation.mutate(payload)),
		previewSrc,
		reset: form.reset,
	};
};
