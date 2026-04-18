import { zodResolver } from "@hookform/resolvers/zod";
import { type SignInPayload, signInPayloadSchema } from "@repo/api/schemas";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { Card, Form, FormInput, Text } from "@/shared/components";

export function SigninForm() {
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
		<Card
			header={
				<>
					<Text>Login to your account</Text>
					<Text size="sm">Enter your email below to login to your account</Text>
				</>
			}
			content={
				<Form onSubmit={form.handleSubmit(onSubmit)} submitText="Login">
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
			}
		/>
	);
}
