import { zodResolver } from "@hookform/resolvers/zod";
import { type SignUpPayload, signUpPayloadSchema } from "@repo/api/schemas";
import type { ComponentProps } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/lib/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/lib/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/shared/lib/ui/field";
import { Input } from "@/shared/lib/ui/input";
import { cn } from "@/shared/lib/utils";

type SignupFormProps = ComponentProps<"div"> & {
	onSwitchToSignIn?: () => void;
};

export function SignupForm({
	className,
	onSwitchToSignIn,
	...props
}: SignupFormProps) {
	const form = useForm<SignUpPayload>({
		resolver: zodResolver(signUpPayloadSchema),
		defaultValues: {
			fullName: "",
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
		onSwitchToSignIn?.();
		form.reset();
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Create an account</CardTitle>
					<CardDescription>
						Enter your information below to create your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						noValidate
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-0"
					>
						<FieldGroup>
							<Controller
								name="fullName"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
										<Input
											{...field}
											id="signup-name"
											type="text"
											autoComplete="name"
											placeholder="John Doe"
											aria-invalid={fieldState.invalid}
										/>
										{fieldState.invalid ? (
											<FieldError errors={[fieldState.error]} />
										) : null}
									</Field>
								)}
							/>
							<Controller
								name="email"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="signup-email">Email</FieldLabel>
										<Input
											{...field}
											id="signup-email"
											type="email"
											autoComplete="email"
											placeholder="m@example.com"
											aria-invalid={fieldState.invalid}
										/>
										<FieldDescription>
											We&apos;ll use this to contact you. We will not share your
											email with anyone else.
										</FieldDescription>
										{fieldState.invalid ? (
											<FieldError errors={[fieldState.error]} />
										) : null}
									</Field>
								)}
							/>
							<Controller
								name="password"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="signup-password">Password</FieldLabel>
										<Input
											{...field}
											id="signup-password"
											type="password"
											autoComplete="new-password"
											aria-invalid={fieldState.invalid}
										/>
										<FieldDescription>
											Must be at least 8 characters long.
										</FieldDescription>
										{fieldState.invalid ? (
											<FieldError errors={[fieldState.error]} />
										) : null}
									</Field>
								)}
							/>
							<Controller
								name="confirmPassword"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="signup-confirm-password">
											Confirm Password
										</FieldLabel>
										<Input
											{...field}
											id="signup-confirm-password"
											type="password"
											autoComplete="new-password"
											aria-invalid={fieldState.invalid}
										/>
										<FieldDescription>
											Please confirm your password.
										</FieldDescription>
										{fieldState.invalid ? (
											<FieldError errors={[fieldState.error]} />
										) : null}
									</Field>
								)}
							/>
							<Field>
								<Button type="submit">Create Account</Button>
								<Button variant="outline" type="button">
									Sign up with Google
								</Button>
								<FieldDescription className="text-center">
									Already have an account?{" "}
									<button
										type="button"
										className="text-foreground underline underline-offset-4 hover:text-primary"
										onClick={onSwitchToSignIn}
									>
										Sign in
									</button>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
