import { useState } from "react";

import { SigninForm, SignupForm } from "@/features/auth-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/lib/ui/tabs";

export function AuthPage() {
	const [tab, setTab] = useState("signin");

	return (
		<main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Tabs
					value={tab}
					onValueChange={setTab}
					className="flex w-full flex-col gap-6"
				>
					<TabsList className="grid w-full grid-cols-2" variant="line">
						<TabsTrigger value="signin">Sign in</TabsTrigger>
						<TabsTrigger value="signup">Sign up</TabsTrigger>
					</TabsList>
					<TabsContent value="signin" className="flex flex-col gap-6">
						<SigninForm onSwitchToSignUp={() => setTab("signup")} />
					</TabsContent>
					<TabsContent value="signup" className="flex flex-col gap-6">
						<SignupForm onSwitchToSignIn={() => setTab("signin")} />
					</TabsContent>
				</Tabs>
			</div>
		</main>
	);
}
