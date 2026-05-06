import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { APP_ROUTES } from "@/app/router";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { ExpenseForm } from "./expense-form";

const { navigateMock } = vi.hoisted(() => ({
	navigateMock: vi.fn(),
}));

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("ExpenseForm", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		vi.mocked(toast.success).mockClear();
		vi.mocked(toast.error).mockClear();
		navigateMock.mockClear();
	});

	describe("validation", () => {
		it("shows title field error when submitting with empty line title", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ExpenseForm />);

			const createButton = screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			});

			await user.click(createButton);

			expect(
				await screen.findByText(
					t("expense-line-item.required", { ns: "form" }),
				),
			).toBeInTheDocument();
		});

		it("shows price field error when submitting with price below 0.01", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ExpenseForm />);

			const createButton = screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			});
			const lineItemLabel = screen.getByLabelText(
				t("expense-line-item.label", { ns: "form" }),
			);
			const priceInput = screen.getByLabelText(
				t("single-amount.label", { ns: "form" }),
			);

			await user.type(lineItemLabel, "Coffee");
			fireEvent.input(priceInput, { target: { value: "0" } });
			await user.click(createButton);

			expect(
				await screen.findByText(t("single-amount.min", { ns: "form" })),
			).toBeInTheDocument();
		});

		it("shows quantity field error when submitting with quantity below 1", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ExpenseForm />);

			const createButton = screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			});
			const lineItemLabel = screen.getByLabelText(
				t("expense-line-item.label", { ns: "form" }),
			);
			const quantityInput = screen.getByLabelText(
				t("quantity.label", { ns: "form" }),
			);

			await user.type(lineItemLabel, "Taxi");
			fireEvent.input(quantityInput, { target: { value: "0" } });
			await user.click(createButton);

			expect(
				await screen.findByText(t("quantity.min", { ns: "form" })),
			).toBeInTheDocument();
		});

		it("add button click creates new expense line", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ExpenseForm />);

			const addButton = screen.getByRole("button", {
				name: t("action.add", { ns: "common" }),
			});

			await user.click(addButton);

			const lineItemInputs = screen.getAllByLabelText(
				t("expense-line-item.label", { ns: "form" }),
			);
			expect(lineItemInputs).toHaveLength(2);
		});
	});

	describe("form submission", () => {
		it("shows success toast and navigates after create", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ExpenseForm />);

			const createButton = screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			});
			const lineItemLabel = screen.getByLabelText(
				t("expense-line-item.label", { ns: "form" }),
			);

			await user.type(lineItemLabel, "Lunch meeting");
			await user.click(createButton);

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith(
					t("toast.success.expense_created", { ns: "common" }),
				);
			});

			expect(navigateMock).toHaveBeenCalledWith(APP_ROUTES.expenses.list);
		});

		it("shows error toast on API error", async () => {
			const user = userEvent.setup();
			server.use(
				http.post("*/expenses", () =>
					HttpResponse.json(
						{ error: { message: "Bad Request" } },
						{ status: 400 },
					),
				),
			);

			renderWithProviders(<ExpenseForm />);

			const createButton = screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			});
			const lineItemLabel = screen.getByLabelText(
				t("expense-line-item.label", { ns: "form" }),
			);

			await user.type(lineItemLabel, "Valid row");
			await user.click(createButton);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(
					t("toast.error.expense_created", { ns: "common" }),
				);
			});

			expect(navigateMock).not.toHaveBeenCalled();
		});
	});
});
