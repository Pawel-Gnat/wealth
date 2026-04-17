import { Button } from "@/shared/lib/ui/button";

export function AuthPage() {
	return (
		<main className="flex min-h-dvh items-center justify-center p-4">
			<h1 className="text-2xl font-semibold">Auth</h1>

			<Button variant="default">Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
		</main>
	);
}
