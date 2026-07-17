import { persistAccessToken } from "@/shared/lib/auth/auth-session";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

if (!baseUrl) {
	throw new Error("VITE_BACKEND_URL is not set");
}

export const refreshAccessTokenRaw = async (): Promise<string | null> => {
	const response = await fetch(`${baseUrl}/auth/refresh`, {
		method: "POST",
		credentials: "include",
	});

	if (!response.ok) {
		return null;
	}

	const body = (await response.json()) as { data?: { token?: string } };
	const token = body.data?.token ?? null;

	if (!token) {
		return null;
	}

	persistAccessToken(token);
	return token;
};
