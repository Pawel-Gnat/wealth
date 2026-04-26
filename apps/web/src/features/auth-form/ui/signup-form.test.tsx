import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { SignupForm } from "./signup-form";

const validPassword = "Abcd1234!";

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("SignupForm", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		vi.mocked(toast.success).mockClear();
		vi.mocked(toast.error).mockClear();
	});

	describe("form submission", () => {
		it("shows success toast and clears the form after sign up", async () => {
			const user = userEvent.setup();
			renderWithProviders(<SignupForm />);

			await user.type(
				screen.getByLabelText(t("email.label", { ns: "form" })),
				"new@example.com",
			);
			await user.type(
				screen.getByLabelText(t("password.label", { ns: "form" })),
				validPassword,
			);
			await user.type(
				screen.getByLabelText(t("confirm-password.label", { ns: "form" })),
				validPassword,
			);
			await user.click(
				screen.getByRole("button", {
					name: t("action.signup", { ns: "common" }),
				}),
			);

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith(
					t("toast.success.account_created", { ns: "common" }),
				);
			});
			expect(
				screen.getByLabelText(t("email.label", { ns: "form" })),
			).toHaveValue("");
		});

		it("shows error toast on API error", async () => {
			const user = userEvent.setup();
			server.use(
				http.post("*/auth/signup", () =>
					HttpResponse.json(
						{ error: { message: "Conflict" } },
						{ status: 409 },
					),
				),
			);

			renderWithProviders(<SignupForm />);

			await user.type(
				screen.getByLabelText(t("email.label", { ns: "form" })),
				"taken@example.com",
			);
			await user.type(
				screen.getByLabelText(t("password.label", { ns: "form" })),
				validPassword,
			);
			await user.type(
				screen.getByLabelText(t("confirm-password.label", { ns: "form" })),
				validPassword,
			);
			await user.click(
				screen.getByRole("button", {
					name: t("action.signup", { ns: "common" }),
				}),
			);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(
					t("toast.error.account_created", { ns: "common" }),
				);
			});
		});
	});

	describe("validation", () => {
		it("shows field errors when submitting an empty form", async () => {
			const user = userEvent.setup();
			renderWithProviders(<SignupForm />);

			await user.click(
				screen.getByRole("button", {
					name: t("action.signup", { ns: "common" }),
				}),
			);

			expect(
				await screen.findByText(t("email.invalid", { ns: "form" })),
			).toBeInTheDocument();
			expect(
				screen.getByText(t("password.min", { ns: "form" })),
			).toBeInTheDocument();
		});
	});
});
