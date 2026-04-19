import { AuthTabs } from "@/features/auth-form";

export function AuthPage() {
	return (
		<main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<AuthTabs />
		</main>
	);
}
