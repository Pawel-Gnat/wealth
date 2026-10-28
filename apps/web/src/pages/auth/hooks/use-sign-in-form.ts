import { zodResolver } from "@hookform/resolvers/zod";
import { signInPayloadSchema } from "@repo/api/schemas";
import type { SessionSnapshotResponse, SignInPayload } from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useAppMutation } from "@/shared/hooks/use-app-mutation";
import { applySessionSnapshot } from "@/shared/lib/auth/auth-api";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

export const useSignInForm = () => {
	const { t } = useTranslation();
	const form = useForm<SignInPayload>({
		resolver: zodResolver(signInPayloadSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const mutation = useAppMutation<
		SessionSnapshotResponse,
		Error,
		SignInPayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				return await controlledAsync(() => orpcClient.user.signIn(payload));
			}),
		onSuccess: (data) => {
			applySessionSnapshot(data.data);
		},
		onError: () => {
			toast.error(t("toast.error.signed-in", { ns: "common" }));
		},
	});

	return {
		control: form.control,
		isPending: mutation.isPending,
		signIn: form.handleSubmit((payload) => mutation.mutate(payload)),
	};
};
