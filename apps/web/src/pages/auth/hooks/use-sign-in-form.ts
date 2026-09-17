import { zodResolver } from "@hookform/resolvers/zod";
import { signInPayloadSchema } from "@repo/api/schemas";
import type { SessionSnapshotResponse, SignInPayload } from "@repo/api/types";
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
import { useLoader } from "@/shared/hooks/use-loader";
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

	const mutation = useMutation<SessionSnapshotResponse, Error, SignInPayload>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				const data = await controlledAsync(() =>
					orpcClient.user.signIn(payload),
				);
				logger.info(AUTH_OBSERVABILITY_EVENTS.signInSucceeded);
				return data;
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
		isLoading: useLoader({ isLoading: mutation.isPending }),
		signIn: form.handleSubmit((payload) => mutation.mutate(payload)),
	};
};
