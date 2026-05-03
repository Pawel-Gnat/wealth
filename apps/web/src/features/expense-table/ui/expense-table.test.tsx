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

		await waitFor(() => {
			expect(
				screen.getByText(t("list.error", { ns: "expenses" })),
			).toBeInTheDocument();
		});
	});

	it("shows empty state when the list has no expenses", async () => {
		server.use(
			http.get("*/expenses", () =>
				HttpResponse.json({ data: [], pagination: {} }),
			),
		);

		renderWithProviders(<ExpenseTable />);

		await waitFor(() => {
			expect(
				screen.getByText(t("list.no-results", { ns: "expenses" })),
			).toBeInTheDocument();
		});
	});

	it("renders rows when expense data is returned", async () => {
		renderWithProviders(<ExpenseTable />);

		await waitFor(() => {
			expect(screen.getByText("acme-march-2024")).toBeInTheDocument();
		});

		expect(
			screen.getByText(
				new Intl.NumberFormat("en", {
					style: "currency",
					currency: "USD",
				}).format(123.45),
			),
		).toBeInTheDocument();

		expect(
			screen.getByRole("link", {
				name: t("common.edit", { ns: "common" }),
			}),
		).toHaveAttribute("href", "/expenses/acme-march-2024");
	});
});
