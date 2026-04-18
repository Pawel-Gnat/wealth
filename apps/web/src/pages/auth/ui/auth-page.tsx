import { SigninForm, SignupForm } from "@/features/auth-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/lib/ui/tabs";

export function AuthPage() {
	return (
		<main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Tabs defaultValue="signin">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="signin">Sign in</TabsTrigger>
						<TabsTrigger value="signup">Sign up</TabsTrigger>
					</TabsList>
					<TabsContent value="signin">
						<SigninForm />
					</TabsContent>
					<TabsContent value="signup">
						<SignupForm />
					</TabsContent>
				</Tabs>
			</div>
		</main>
	);
}
