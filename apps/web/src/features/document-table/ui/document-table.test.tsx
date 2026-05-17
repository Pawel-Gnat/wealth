import {
	EXPENSE_DELETED_MESSAGE,
	INCOME_DELETED_MESSAGE,
} from "@repo/api/schemas";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DOCUMENT_CONFIG } from "@/features/document/model/document-config";
import type { RecordKind } from "@/features/document/model/record-kind";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { DocumentTable } from "./document-table";

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const documentId = "01JTZKQX2GT6PHGQER0M8FS6K8";

const tableKinds = [
	{
		kind: "expense",
		apiSegment: "expenses",
		deleteMessage: EXPENSE_DELETED_MESSAGE,
	},
	{
		kind: "income",
		apiSegment: "incomes",
		deleteMessage: INCOME_DELETED_MESSAGE,
	},
] as const satisfies readonly {
	kind: RecordKind;
	apiSegment: string;
	deleteMessage: string;
}[];

describe.each(tableKinds)("$kind DocumentTable", ({
	kind,
	apiSegment,
	deleteMessage,
}) => {
	const config = DOCUMENT_CONFIG[kind];
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		vi.mocked(toast.success).mockClear();
		vi.mocked(toast.error).mockClear();
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

	it("deletes a document and refreshes the list", async () => {
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
			http.delete(`*/${apiSegment}/:id`, () =>
				HttpResponse.json({
					data: { message: deleteMessage },
				}),
			),
		);

		renderWithProviders(<DocumentTable kind={kind} />);

		const deleteButtonLabel = t("action.delete", { ns: "common" });
		const noResultsMessage = t("list.no-results", { ns: config.i18nNamespace });
		const successToastMessage = t(config.toast.deleted, { ns: "common" });
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
			http.delete(`*/${apiSegment}/:id`, () =>
				HttpResponse.json({ message: "Delete failed" }, { status: 500 }),
			),
		);

		renderWithProviders(<DocumentTable kind={kind} />);
		const deleteButtonLabel = t("action.delete", { ns: "common" });
		const errorToastMessage = t(config.toast.deleteError, { ns: "common" });
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
