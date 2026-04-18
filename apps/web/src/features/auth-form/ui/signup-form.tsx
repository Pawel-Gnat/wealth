import { zodResolver } from "@hookform/resolvers/zod";
import { type SignUpPayload, signUpPayloadSchema } from "@repo/api/schemas";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, Form, FormInput, Text } from "@/shared/components";

export function SignupForm() {
	const form = useForm<SignUpPayload>({
		resolver: zodResolver(signUpPayloadSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	function onSubmit(_data: SignUpPayload) {
		// Replace with API sign-up.
		toast.success("Account created", {
			description: "You can sign in with your email and password.",
		});
		form.reset();
	}

	return (
		<Card
			header={
				<>
					<Text>Create an account</Text>
					<Text size="sm">
						Enter your information below to create your account
					</Text>
				</>
			}
			content={
				<Form
					onSubmit={form.handleSubmit(onSubmit)}
					submitText="Create Account"
				>
					<FormInput
						name="email"
						label="Email"
						type="email"
						placeholder="m@example.com"
						control={form.control}
					/>
					<FormInput
						name="password"
						label="Password"
						type="password"
						control={form.control}
					/>
					<FormInput
						name="confirmPassword"
						label="Confirm Password"
						type="password"
						control={form.control}
					/>
				</Form>
			}
		/>
	);
}
