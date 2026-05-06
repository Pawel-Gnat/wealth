import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { ExpenseTable } from "./expense-table";

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("ExpenseTable", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		vi.mocked(toast.success).mockClear();
		vi.mocked(toast.error).mockClear();
	});

	it("shows error state when the expenses request fails", async () => {
		server.use(
			http.get("*/expenses", () =>
				HttpResponse.json({ message: "Server error" }, { status: 500 }),
			),
		);

		renderWithProviders(<ExpenseTable />);
		const errorMessage = t("list.error", { ns: "expenses" });

		await waitFor(() => {
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});
	});

	it("shows empty state when the list has no expenses", async () => {
		server.use(
			http.get("*/expenses", () =>
				HttpResponse.json({ data: [], pagination: {} }),
			),
		);

		renderWithProviders(<ExpenseTable />);
		const noResultsMessage = t("list.no-results", { ns: "expenses" });

		await waitFor(() => {
			expect(screen.getByText(noResultsMessage)).toBeInTheDocument();
		});
	});

	it("renders rows when expense data is returned", async () => {
		const expenseId = "01JTZKQX2GT6PHGQER0M8FS6K8";
		const expenseDate = new Date("2024-03-01T12:00:00.000Z");
		const formattedDate = expenseDate.toLocaleDateString("en");
		const formattedAmount = new Intl.NumberFormat("en", {
			style: "currency",
			currency: "USD",
		}).format(123.45);
		const editActionLabel = t("action.edit", { ns: "common" });

		renderWithProviders(<ExpenseTable />);

		await waitFor(() => {
			expect(screen.getByText(formattedDate)).toBeInTheDocument();
		});

		const editLink = screen.getByRole("link", {
			name: editActionLabel,
		});

		expect(screen.getByText(formattedAmount)).toBeInTheDocument();
		expect(editLink).toHaveAttribute("href", `/expenses/${expenseId}`);
	});

	it("deletes expense and refreshes the list", async () => {
		const user = userEvent.setup();
		let listCallCount = 0;

		server.use(
			http.get("*/expenses", () => {
				listCallCount += 1;
				if (listCallCount === 1) {
					return HttpResponse.json({
						data: [
							{
								id: "01JTZKQX2GT6PHGQER0M8FS6K8",
								date: "2024-03-01T12:00:00.000Z",
								totalAmount: 123.45,
							},
						],
						pagination: {},
					});
				}

				return HttpResponse.json({ data: [], pagination: {} });
			}),
			http.delete("*/expenses", () =>
				HttpResponse.json({
					data: { message: "expense_deleted" as const },
				}),
			),
		);

		renderWithProviders(<ExpenseTable />);

		const deleteButtonLabel = t("action.delete", { ns: "common" });
		const noResultsMessage = t("list.no-results", { ns: "expenses" });
		const successToastMessage = t("toast.success.expense_deleted", {
			ns: "common",
		});
		const deleteButton = await screen.findByRole("button", {
			name: deleteButtonLabel,
		});

		expect(deleteButton).toBeInTheDocument();
		await user.click(deleteButton);

		await waitFor(() => {
			const noResultsElement = screen.getByText(noResultsMessage);
			expect(toast.success).toHaveBeenCalledWith(successToastMessage);
			expect(noResultsElement).toBeInTheDocument();
		});

		expect(listCallCount).toBeGreaterThanOrEqual(2);
	});

	it("shows error toast when delete fails", async () => {
		const user = userEvent.setup();

		server.use(
			http.delete("*/expenses", () =>
				HttpResponse.json({ message: "Delete failed" }, { status: 500 }),
			),
		);

		renderWithProviders(<ExpenseTable />);
		const deleteButtonLabel = t("action.delete", { ns: "common" });
		const errorToastMessage = t("toast.error.expense_deleted", {
			ns: "common",
		});
		const deleteButton = await screen.findByRole("button", {
			name: deleteButtonLabel,
		});

		expect(deleteButton).toBeInTheDocument();
		await user.click(deleteButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(errorToastMessage);
		});
	});
});
