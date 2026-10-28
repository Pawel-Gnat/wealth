import { zodResolver } from "@hookform/resolvers/zod";
import { userEditDetailsSchema } from "@repo/api/schemas";
import type {
	User,
	UserEditDetailsPayload,
	UserEditDetailsResponse,
} from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useAppMutation } from "@/shared/hooks/use-app-mutation";
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

	const mutation = useAppMutation<
		UserEditDetailsResponse,
		Error,
		UserEditDetailsPayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				return await controlledAsync(() =>
					orpcClient.settings.details(payload),
				);
			}),
		onSuccess: (_data, payload) => {
			form.reset(payload);
			queryClient.setQueryData(queryKeys.me(), (current: User | null) =>
				current
					? {
							...current,
							firstName: payload.firstName || null,
							lastName: payload.lastName || null,
						}
					: current,
			);
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
