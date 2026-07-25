import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { SigninForm } from "@/pages/auth/ui/signin-form";
import { logoutSession } from "@/shared/lib/auth/auth-api";
import { clearAuthSession } from "@/shared/lib/auth/auth-session";
import { resetRefreshMutex } from "@/shared/lib/auth/refresh-access-token";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";

const startSseGateway = vi.fn();
const stopSseGateway = vi.fn();

vi.mock("@/shared/lib/sse", () => ({
	startSseGateway: () => startSseGateway(),
	stopSseGateway: () => stopSseGateway(),
}));

describe("AuthProvider SSE wiring", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

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

	it("keeps sign-in fields visible and does not start SSE without a session", async () => {
		renderWithProviders(<SigninForm />);

		expect(
			await screen.findByLabelText(t("email.label", { ns: "form" })),
		).toBeInTheDocument();
		expect(
			screen.getByLabelText(t("password.label", { ns: "form" })),
		).toBeInTheDocument();

		await waitFor(() => {
			expect(startSseGateway).not.toHaveBeenCalled();
		});
	});

	it("starts SSE after a successful sign in", async () => {
		const user = userEvent.setup();
		renderWithProviders(<SigninForm />);

		await user.type(
			await screen.findByLabelText(t("email.label", { ns: "form" })),
			"test@example.com",
		);
		await user.type(
			screen.getByLabelText(t("password.label", { ns: "form" })),
			"secret",
		);
		await user.click(
			screen.getByRole("button", {
				name: t("action.signin", { ns: "common" }),
			}),
		);

		await waitFor(() => {
			expect(startSseGateway).toHaveBeenCalled();
		});
	});

	it("stops SSE after logout", async () => {
		const user = userEvent.setup();
		renderWithProviders(<SigninForm />);

		await user.type(
			await screen.findByLabelText(t("email.label", { ns: "form" })),
			"test@example.com",
		);
		await user.type(
			screen.getByLabelText(t("password.label", { ns: "form" })),
			"secret",
		);
		await user.click(
			screen.getByRole("button", {
				name: t("action.signin", { ns: "common" }),
			}),
		);

		await waitFor(() => {
			expect(startSseGateway).toHaveBeenCalled();
		});

		stopSseGateway.mockClear();
		await logoutSession();

		expect(stopSseGateway).toHaveBeenCalled();
		expect(
			screen.getByLabelText(t("email.label", { ns: "form" })),
		).toBeInTheDocument();
	});
});
