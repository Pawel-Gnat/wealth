import { screen, waitFor } from "@testing-library/react";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { APP_ROUTES } from "@/app/routes";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { DocumentTable } from "./document-table";

const documentId = "01JTZKQX2GT6PHGQER0M8FS6K8";

describe("DocumentTable", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("shows error state when the list request fails", async () => {
		server.use(
			http.get("*/records", () =>
				HttpResponse.json({ message: "Server error" }, { status: 500 }),
			),
		);

		renderWithProviders(<DocumentTable />);

		await waitFor(() => {
			expect(
				screen.getByText(t("list.error.title", { ns: "records" })),
			).toBeInTheDocument();
		});
	});

	it("shows empty state when the list has no items", async () => {
		server.use(
			http.get("*/records", () =>
				HttpResponse.json({ data: [], pagination: {} }),
			),
		);

		renderWithProviders(<DocumentTable />);

		await waitFor(() => {
			expect(
				screen.getByText(t("list.empty.title", { ns: "records" })),
			).toBeInTheDocument();
		});
	});

	it("renders rows when data is returned", async () => {
		const documentDate = new Date("2024-03-01T12:00:00.000Z");
		const formattedDate = documentDate.toLocaleDateString("en", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		const formattedAmount = new Intl.NumberFormat("en", {
			style: "currency",
			currency: "USD",
		}).format(123.45);
		const previewActionLabel = t("action.preview", { ns: "common" });

		renderWithProviders(<DocumentTable />);

		await waitFor(() => {
			expect(screen.getByText(formattedDate)).toBeInTheDocument();
		});

		const previewLink = screen.getByRole("link", {
			name: previewActionLabel,
		});

		expect(screen.getByText("expense")).toBeInTheDocument();
		expect(screen.getByText(formattedAmount)).toBeInTheDocument();
		expect(previewLink).toHaveAttribute(
			"href",
			APP_ROUTES.records.view(documentId),
		);
	});
});
