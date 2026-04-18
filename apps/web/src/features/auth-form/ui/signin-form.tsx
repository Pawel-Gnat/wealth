import { zodResolver } from "@hookform/resolvers/zod";
import { type SignInPayload, signInPayloadSchema } from "@repo/api/schemas";
import type { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { Form } from "@/shared/components/form/form";
import { FormInput } from "@/shared/components/form/form-input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/lib/ui/card";
import { cn } from "@/shared/lib/utils";

type SigninFormProps = ComponentProps<"div"> & {
	onSwitchToSignUp?: () => void;
};

export function SigninForm({
	className,
	onSwitchToSignUp,
	...props
}: SigninFormProps) {
	const { login } = useAuth();
	const form = useForm<SignInPayload>({
		resolver: zodResolver(signInPayloadSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	function onSubmit(data: SignInPayload) {
		// Replace with API sign-in; token from response.
		login("stub-token");
		toast.success("Signed in", {
			description: `${data.email}`,
		});
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form onSubmit={form.handleSubmit(onSubmit)}>
						<FormInput
							name="email"
							label="Email"
							type="email"
							control={form.control}
						/>

						<FormInput
							name="password"
							label="Password"
							type="password"
							control={form.control}
						/>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
