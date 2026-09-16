import { zodResolver } from "@hookform/resolvers/zod";
import { userEditPasswordSchema } from "@repo/api/schemas";
import type { UserEditPasswordPayload } from "@repo/api/types";
import { useForm } from "react-hook-form";

export const usePasswordForm = () => {
	return useForm<UserEditPasswordPayload>({
		resolver: zodResolver(userEditPasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});
};
