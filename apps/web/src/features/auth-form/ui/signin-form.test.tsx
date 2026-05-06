import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_TOKEN_STORAGE_KEY } from "@/context/auth";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { SigninForm } from "./signin-form";

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
	},
}));

describe("SigninForm", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		vi.mocked(toast.error).mockClear();
		localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
	});

	describe("form submission", () => {
		it("persists token after successful sign in", async () => {
			const user = userEvent.setup();
			renderWithProviders(<SigninForm />);
			const emailInput = screen.getByLabelText(
				t("email.label", { ns: "form" }),
			);
			const passwordInput = screen.getByLabelText(
				t("password.label", { ns: "form" }),
			);
			const signinButton = screen.getByRole("button", {
				name: t("action.signin", { ns: "common" }),
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "secret");
			await user.click(signinButton);

			await waitFor(() => {
				expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(
					"mock-jwt-access-token",
				);
			});
		});

		it("shows error toast on API error", async () => {
			const user = userEvent.setup();
			server.use(
				http.post("*/auth/signin", () =>
					HttpResponse.json(
						{ error: { message: "Unauthorized" } },
						{ status: 401 },
					),
				),
			);

			renderWithProviders(<SigninForm />);
			const emailInput = screen.getByLabelText(
				t("email.label", { ns: "form" }),
			);
			const passwordInput = screen.getByLabelText(
				t("password.label", { ns: "form" }),
			);
			const signinButton = screen.getByRole("button", {
				name: t("action.signin", { ns: "common" }),
			});

			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "secret");
			await user.click(signinButton);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(
					t("toast.error.signed_in", { ns: "common" }),
				);
			});
		});
	});

	describe("validation", () => {
		it("shows field errors when submitting an empty form", async () => {
			const user = userEvent.setup();
			renderWithProviders(<SigninForm />);
			const signinButton = screen.getByRole("button", {
				name: t("action.signin", { ns: "common" }),
			});

			await user.click(signinButton);

			expect(
				await screen.findByText(t("email.invalid", { ns: "form" })),
			).toBeInTheDocument();
			expect(
				screen.getByText(t("password.invalid-length", { ns: "form" })),
			).toBeInTheDocument();
		});
	});
});
