import { zodResolver } from "@hookform/resolvers/zod";
import { type SignInPayload, signInPayloadSchema } from "@repo/api/schemas";
import type { ComponentProps } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
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
					<form
						noValidate
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-0"
					>
						<FieldGroup>
							<Controller
								name="email"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="signin-email">Email</FieldLabel>
										<Input
											{...field}
											id="signin-email"
											type="email"
											autoComplete="email"
											placeholder="m@example.com"
											aria-invalid={fieldState.invalid}
										/>
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
										<div className="flex items-center">
											<FieldLabel htmlFor="signin-password">
												Password
											</FieldLabel>
											<button
												type="button"
												className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
											>
												Forgot your password?
											</button>
										</div>
										<Input
											{...field}
											id="signin-password"
											type="password"
											autoComplete="current-password"
											aria-invalid={fieldState.invalid}
										/>
										{fieldState.invalid ? (
											<FieldError errors={[fieldState.error]} />
										) : null}
									</Field>
								)}
							/>
							<Field>
								<Button type="submit">Login</Button>
								<Button variant="outline" type="button">
									Login with Google
								</Button>
								<FieldDescription className="text-center">
									Don&apos;t have an account?{" "}
									<button
										type="button"
										className="text-foreground underline underline-offset-4 hover:text-primary"
										onClick={onSwitchToSignUp}
									>
										Sign up
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
