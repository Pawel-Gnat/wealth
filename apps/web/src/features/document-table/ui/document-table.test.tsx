import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { DOCUMENT_CONFIG } from "@/features/document/model/document-config";
import type { RecordKind } from "@/features/document/model/record-kind";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";
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
		const errorMessage = t("list.error", { ns: config.i18nNamespace });

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
		const noResultsMessage = t("list.no-results", { ns: config.i18nNamespace });

		await waitFor(() => {
			expect(screen.getByText(noResultsMessage)).toBeInTheDocument();
		});
	});

	it("renders rows when data is returned", async () => {
		const documentDate = new Date("2024-03-01T12:00:00.000Z");
		const formattedDate = documentDate.toLocaleDateString("en");
		const formattedAmount = new Intl.NumberFormat("en", {
			style: "currency",
			currency: "USD",
		}).format(123.45);
		const editActionLabel = t("action.edit", { ns: "common" });

		renderWithProviders(<DocumentTable kind={kind} />);

		await waitFor(() => {
			expect(screen.getByText(formattedDate)).toBeInTheDocument();
		});

		const editLink = screen.getByRole("link", {
			name: editActionLabel,
		});

		expect(screen.getByText(formattedAmount)).toBeInTheDocument();
		expect(editLink).toHaveAttribute("href", config.editRoute(documentId));
	});

	it("opens delete dialog without deleting yet", async () => {
		const user = userEvent.setup();
		let deleteCallCount = 0;

		server.use(
			http.delete(`*/${apiSegment}/:id`, () => {
				deleteCallCount += 1;
				return HttpResponse.json({ data: { message: "deleted" } });
			}),
		);

		renderWithProviders(<DocumentTable kind={kind} />);
		const deleteButtonLabel = t("action.delete", { ns: "common" });
		const deleteButton = await screen.findByRole("button", {
			name: deleteButtonLabel,
		});

		await user.click(deleteButton);

		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(deleteCallCount).toBe(0);
	});

	it("refreshes the list after confirmed delete", async () => {
		const user = userEvent.setup();
		let listCallCount = 0;

		server.use(
			http.get(`*/${apiSegment}`, () => {
				listCallCount += 1;
				if (listCallCount === 1) {
					return HttpResponse.json({
						data: [
							{
								id: documentId,
								date: "2024-03-01T12:00:00.000Z",
								totalAmount: 123.45,
							},
						],
						pagination: {},
					});
				}

				return HttpResponse.json({ data: [], pagination: {} });
			}),
		);

		const { queryClient } = renderWithProviders(<DocumentTable kind={kind} />);
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

		const deleteButtonLabel = t("action.delete", { ns: "common" });
		const noResultsMessage = t("list.no-results", { ns: config.i18nNamespace });
		const deleteButton = await screen.findByRole("button", {
			name: deleteButtonLabel,
		});

		await user.click(deleteButton);

		const dialog = screen.getByRole("alertdialog");
		await user.click(
			within(dialog).getByRole("button", { name: deleteButtonLabel }),
		);

		await waitFor(() => {
			expect(screen.getByText(noResultsMessage)).toBeInTheDocument();
		});

		expect(listCallCount).toBeGreaterThanOrEqual(2);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: queryKeys.dashboard.all(),
		});
	});
});
