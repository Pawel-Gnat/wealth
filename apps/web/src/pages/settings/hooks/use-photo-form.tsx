import { zodResolver } from "@hookform/resolvers/zod";
import { userEditPhotoSchema } from "@repo/api/schemas";
import type {
	UserEditPhotoPayload,
	UserEditPhotoResponse,
} from "@repo/api/types";
import {
	AUTH_OBSERVABILITY_EVENTS,
	logger,
	runWithRequestId,
} from "@repo/observability/browser";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UsePhotoFormProps = {
	onSuccess?: () => void;
};

export const usePhotoForm = ({ onSuccess }: UsePhotoFormProps = {}) => {
	const { t } = useTranslation();
	const form = useForm<UserEditPhotoPayload>({
		resolver: zodResolver(userEditPhotoSchema),
	});

	const photo = useWatch({ control: form.control, name: "photo" });
	const previewSrc = useMemo(() => {
		if (!(photo instanceof File) || typeof URL.createObjectURL !== "function") {
			return null;
		}

		return URL.createObjectURL(photo);
	}, [photo]);

	useEffect(() => {
		return () => {
			if (previewSrc) {
				URL.revokeObjectURL(previewSrc);
			}
		};
	}, [previewSrc]);

	const mutation = useMutation<
		UserEditPhotoResponse,
		Error,
		UserEditPhotoPayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				const data = await controlledAsync(() =>
					orpcClient.settings.photo(payload),
				);
				logger.info(AUTH_OBSERVABILITY_EVENTS.photoUpdateSucceeded);
				return data;
			}),
		onSuccess: () => {
			form.reset();
			toast.success(t("toast.success.photo-updated", { ns: "common" }));
			onSuccess?.();
		},
		onError: () => {
			toast.error(t("toast.error.photo-updated", { ns: "common" }));
		},
	});

	return {
		control: form.control,
		isPending: mutation.isPending,
		updatePhoto: form.handleSubmit((payload) => mutation.mutate(payload)),
		previewSrc,
		reset: form.reset,
	};
};
