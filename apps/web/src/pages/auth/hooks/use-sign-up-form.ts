import { zodResolver } from "@hookform/resolvers/zod";
import { createUserPayloadSchema } from "@repo/api/schemas";
import type { CreateUserPayload, CreateUserResponse } from "@repo/api/types";
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

	const mutation = useMutation<CreateUserResponse, Error, CreateUserPayload>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				const data = await controlledAsync(() =>
					orpcClient.user.signUp(payload),
				);
				logger.info(AUTH_OBSERVABILITY_EVENTS.signUpSucceeded);
				return data;
			}),
		onSuccess: () => {
			form.reset();
			toast.success(t("toast.success.account-created", { ns: "common" }));
			onSignedUp();
		},
		onError: () => {
			toast.error(t("toast.error.account-created", { ns: "common" }));
		},
	});

	return {
		control: form.control,
		isLoading: useLoader({ isLoading: mutation.isPending }),
		signUp: form.handleSubmit((payload) => mutation.mutate(payload)),
	};
};
