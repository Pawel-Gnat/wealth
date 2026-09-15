import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@/context/auth";
import { resetRefreshMutex } from "@/shared/lib/auth/auth-api";
import {
	applySessionSnapshot,
	clearAuthSession,
} from "@/shared/lib/auth/auth-session";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";

const startSseGateway = vi.fn();
const stopSseGateway = vi.fn();

vi.mock("@/shared/lib/sse", () => ({
	startSseGateway: () => startSseGateway(),
	stopSseGateway: () => stopSseGateway(),
}));

const unauthorizedMe = () =>
	http.get("*/auth/me", () =>
		HttpResponse.json({ error: { message: "Unauthorized" } }, { status: 401 }),
	);

const AuthProbe = () => {
	const { user, isAuthLoading, logout } = useAuth();

	if (isAuthLoading) {
		return <div data-testid="auth-loading">loading</div>;
	}

	return (
		<div>
			<div data-testid="auth-user">{user?.email ?? "anonymous"}</div>
			<button type="button" onClick={() => void logout()}>
				logout
			</button>
		</div>
	);
};

describe("AuthProvider", () => {
	beforeEach(() => {
		clearAuthSession();
		resetRefreshMutex();
		startSseGateway.mockClear();
		stopSseGateway.mockClear();
	});

	afterEach(() => {
		clearAuthSession();
		resetRefreshMutex();
	});

	it("throws when useAuth is used outside AuthProvider", () => {
		expect(() => render(<AuthProbe />)).toThrow(
			"useAuth must be used within AuthProvider",
		);
	});

	it("sets user from GET /me and starts SSE", async () => {
		renderWithProviders(<AuthProbe />);

		expect(screen.getByTestId("auth-loading")).toBeInTheDocument();

		expect(await screen.findByTestId("auth-user")).toHaveTextContent(
			"test@example.com",
		);
		expect(startSseGateway).toHaveBeenCalled();
	});

	it("leaves user unset and does not start SSE when GET /me is unauthorized", async () => {
		server.use(unauthorizedMe());
		renderWithProviders(<AuthProbe />);

		expect(await screen.findByTestId("auth-user")).toHaveTextContent(
			"anonymous",
		);
		expect(startSseGateway).not.toHaveBeenCalled();
	});

	it("applies a snapshot from sign-in and starts SSE", async () => {
		server.use(unauthorizedMe());
		renderWithProviders(<AuthProbe />);

		expect(await screen.findByTestId("auth-user")).toHaveTextContent(
			"anonymous",
		);

		applySessionSnapshot({
			user: {
				id: "01JTZKQX2GT6PHGQER0M8FS6K8",
				email: "ada@example.com",
			},
			sessionExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
		});

		await waitFor(() => {
			expect(screen.getByTestId("auth-user")).toHaveTextContent(
				"ada@example.com",
			);
		});
		expect(startSseGateway).toHaveBeenCalled();
	});

	it("clears user and stops SSE on logout", async () => {
		const user = userEvent.setup();
		renderWithProviders(<AuthProbe />);

		expect(await screen.findByTestId("auth-user")).toHaveTextContent(
			"test@example.com",
		);

		stopSseGateway.mockClear();
		await user.click(screen.getByRole("button", { name: "logout" }));

		await waitFor(() => {
			expect(screen.getByTestId("auth-user")).toHaveTextContent("anonymous");
		});
		expect(stopSseGateway).toHaveBeenCalled();
	});
});
