import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth, useUser } from "@/context/auth";
import {
	applySessionSnapshot,
	clearAuthSession,
	resetRefreshMutex,
} from "@/shared/lib/auth/auth-api";
import { MOCK_USER } from "@/test/mocks/user";
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
	const { isAuthLoading, isBootstrapError, retryBootstrap, logout } = useAuth();
	const { data: user } = useUser();

	if (isAuthLoading) {
		return <div data-testid="auth-loading">loading</div>;
	}

	if (isBootstrapError) {
		return (
			<div>
				<div data-testid="auth-bootstrap-error">bootstrap-error</div>
				<button type="button" onClick={retryBootstrap}>
					retry
				</button>
			</div>
		);
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

	it("seeds the user query from GET /me and starts SSE", async () => {
		renderWithProviders(<AuthProbe />);

		expect(screen.getByTestId("auth-loading")).toBeInTheDocument();

		expect(await screen.findByTestId("auth-user")).toHaveTextContent(
			"test@example.com",
		);
		expect(startSseGateway).toHaveBeenCalled();
	});

	it("leaves the user query unset and does not start SSE when GET /me is unauthorized", async () => {
		server.use(unauthorizedMe());
		renderWithProviders(<AuthProbe />);

		expect(await screen.findByTestId("auth-user")).toHaveTextContent(
			"anonymous",
		);
		expect(startSseGateway).not.toHaveBeenCalled();
	});

	it("applies a snapshot from sign-in into the user query and starts SSE", async () => {
		server.use(unauthorizedMe());
		renderWithProviders(<AuthProbe />);

		expect(await screen.findByTestId("auth-user")).toHaveTextContent(
			"anonymous",
		);

		applySessionSnapshot({
			user: { ...MOCK_USER, email: "ada@example.com" },
			sessionExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
		});

		await waitFor(() => {
			expect(screen.getByTestId("auth-user")).toHaveTextContent(
				"ada@example.com",
			);
		});
		expect(startSseGateway).toHaveBeenCalled();
	});

	it("clears the user query and stops SSE on logout", async () => {
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

	it("shows a retryable error when GET /me fails with a non-auth error", async () => {
		const user = userEvent.setup();
		let meCalls = 0;
		server.use(
			http.get("*/auth/me", () => {
				meCalls += 1;
				if (meCalls === 1) {
					return HttpResponse.json(
						{ error: { message: "Internal Server Error" } },
						{ status: 500 },
					);
				}

				return HttpResponse.json({
					data: {
						user: MOCK_USER,
						sessionExpiresAt: new Date(
							Date.now() + 15 * 60 * 1000,
						).toISOString(),
					},
				});
			}),
		);

		renderWithProviders(<AuthProbe />);

		expect(
			await screen.findByTestId("auth-bootstrap-error"),
		).toBeInTheDocument();
		expect(startSseGateway).not.toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: "retry" }));

		expect(await screen.findByTestId("auth-user")).toHaveTextContent(
			"test@example.com",
		);
		expect(startSseGateway).toHaveBeenCalled();
	});
});
