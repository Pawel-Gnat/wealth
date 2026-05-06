import { screen, waitFor } from "@testing-library/react";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { ExpenseTable } from "./expense-table";

describe("ExpenseTable", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
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
});
