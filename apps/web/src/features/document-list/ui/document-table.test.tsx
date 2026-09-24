import { screen, waitFor } from "@testing-library/react";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { DOCUMENT_CONFIG } from "@/features/config/document-config";
import type { RecordKind } from "@/features/model/record-kind";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { DocumentTable } from "./document-table";

const documentId = "01JTZKQX2GT6PHGQER0M8FS6K8";

const tableKinds = [
	{
		kind: "expense",
		apiSegment: "expenses",
	},
	{
		kind: "income",
		apiSegment: "incomes",
	},
] as const satisfies readonly {
	kind: RecordKind;
	apiSegment: string;
}[];

describe.each(tableKinds)("$kind DocumentTable", ({ kind, apiSegment }) => {
	const config = DOCUMENT_CONFIG[kind];
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("shows error state when the list request fails", async () => {
		server.use(
			http.get(`*/${apiSegment}`, () =>
				HttpResponse.json({ message: "Server error" }, { status: 500 }),
			),
		);

		renderWithProviders(<DocumentTable kind={kind} />);
		const errorMessage = t("list.error.title", { ns: config.i18nNamespace });

		await waitFor(() => {
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});
	});

	it("shows empty state when the list has no items", async () => {
		server.use(
			http.get(`*/${apiSegment}`, () =>
				HttpResponse.json({ data: [], pagination: {} }),
			),
		);

		renderWithProviders(<DocumentTable kind={kind} />);
		const noResultsMessage = t("list.empty.title", {
			ns: config.i18nNamespace,
		});

		await waitFor(() => {
			expect(screen.getByText(noResultsMessage)).toBeInTheDocument();
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

		renderWithProviders(<DocumentTable kind={kind} />);

		await waitFor(() => {
			expect(screen.getByText(formattedDate)).toBeInTheDocument();
		});

		const previewLink = screen.getByRole("link", {
			name: previewActionLabel,
		});

		expect(screen.getByText(formattedAmount)).toBeInTheDocument();
		expect(previewLink).toHaveAttribute("href", config.viewRoute(documentId));
	});
});
