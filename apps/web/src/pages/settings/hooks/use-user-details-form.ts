import { zodResolver } from "@hookform/resolvers/zod";
import { userEditDetailsSchema } from "@repo/api/schemas";
import type {
	User,
	UserEditDetailsPayload,
	UserEditDetailsResponse,
} from "@repo/api/types";
import {
	AUTH_OBSERVABILITY_EVENTS,
	logger,
	runWithRequestId,
} from "@repo/observability/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export const useUserDetailsForm = (user: User) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const form = useForm<UserEditDetailsPayload>({
		resolver: zodResolver(userEditDetailsSchema),
		defaultValues: {
			firstName: user.firstName ?? "",
			lastName: user.lastName ?? "",
		},
	});

	const mutation = useMutation<
		UserEditDetailsResponse,
		Error,
		UserEditDetailsPayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				const data = await controlledAsync(() =>
					orpcClient.settings.details(payload),
				);
				logger.info(AUTH_OBSERVABILITY_EVENTS.detailsUpdateSucceeded);
				return data;
			}),
		onSuccess: async (_data, payload) => {
			form.reset(payload);
			await queryClient.invalidateQueries({ queryKey: queryKeys.me() });
			toast.success(t("toast.success.details-updated", { ns: "common" }));
		},
		onError: () => {
			toast.error(t("toast.error.details-updated", { ns: "common" }));
		},
	});

	return {
		control: form.control,
		isPending: mutation.isPending,
		updateDetails: form.handleSubmit((payload) => mutation.mutate(payload)),
	};
};
