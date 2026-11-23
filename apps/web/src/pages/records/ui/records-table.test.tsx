import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { APP_ROUTES } from "@/app/routes";
import { formatPrice } from "@/shared/components/price/helpers/price.helpers";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { RecordsTable } from "./records-table";

const recordId = "01JTZKQX2GT6PHGQER0M8FS6K8";

describe("RecordTable", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
		HTMLElement.prototype.hasPointerCapture = () => false;
		HTMLElement.prototype.setPointerCapture = () => {};
		HTMLElement.prototype.releasePointerCapture = () => {};
		HTMLElement.prototype.scrollIntoView = () => {};
	});

	it("shows error state when the list request fails", async () => {
		server.use(
			http.get("*/records", () =>
				HttpResponse.json({ message: "Server error" }, { status: 500 }),
			),
		);

		renderWithProviders(<RecordsTable />);

		await waitFor(() => {
			expect(
				screen.getByText(t("list.error.title", { ns: "records" })),
			).toBeInTheDocument();
		});
	});

	it("shows empty state when the list has no items", async () => {
		server.use(
			http.get("*/records", () =>
				HttpResponse.json({
					data: [],
					pagination: {
						page: 1,
						totalPages: 0,
						hasNextPage: false,
						hasPreviousPage: false,
					},
				}),
			),
		);

		renderWithProviders(<RecordsTable />);

		await waitFor(() => {
			expect(
				screen.getByText(t("list.empty.title", { ns: "records" })),
			).toBeInTheDocument();
		});
	});

	it("renders rows when data is returned", async () => {
		const recordDate = new Date("2024-03-01T12:00:00.000Z");
		const formattedDate = recordDate.toLocaleDateString("en", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		const formattedAmount = formatPrice(123.45, "en");
		const previewActionLabel = t("action.preview", { ns: "common" });

		renderWithProviders(<RecordsTable />);

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
			APP_ROUTES.records.view(recordId),
		);
	});

	it("requests the page stored in the url and the next page after the pager", async () => {
		const user = userEvent.setup();
		const requestedPages: Array<string | null> = [];

		server.use(
			http.get("*/records", ({ request }) => {
				const page = new URL(request.url).searchParams.get("page");
				requestedPages.push(page);

				return HttpResponse.json({
					data: [
						{
							id: recordId,
							date: "2024-03-01T12:00:00.000Z",
							kind: "expense",
							totalAmount: Number(page ?? "1"),
						},
					],
					pagination: {
						page: Number(page ?? "1"),
						totalPages: 2,
						hasNextPage: page !== "2",
						hasPreviousPage: page === "2",
					},
				});
			}),
		);

		renderWithProviders(<RecordsTable />, {
			initialEntries: ["/records?page=2"],
		});

		await screen.findByText(formatPrice(2, "en"));
		expect(requestedPages).toContain("2");

		await user.click(
			screen.getByRole("button", {
				name: t("pagination.previous", { ns: "common" }),
			}),
		);

		await screen.findByText(formatPrice(1, "en"));
		expect(
			requestedPages.some((value) => value === null || value === "1"),
		).toBe(true);
	});

	it("moves an out of range page back to the last page", async () => {
		const requestedPages: Array<string | null> = [];

		server.use(
			http.get("*/records", ({ request }) => {
				const page = new URL(request.url).searchParams.get("page");
				requestedPages.push(page);

				return HttpResponse.json({
					data:
						page === "2"
							? [
									{
										id: recordId,
										date: "2024-03-01T12:00:00.000Z",
										kind: "expense",
										totalAmount: 2,
									},
								]
							: [],
					pagination: {
						page: Number(page ?? "1"),
						totalPages: 2,
						hasNextPage: false,
						hasPreviousPage: page === "3",
					},
				});
			}),
		);

		renderWithProviders(<RecordsTable />, {
			initialEntries: ["/records?page=3"],
		});

		await screen.findByText(formatPrice(2, "en"));
		expect(requestedPages).toContain("3");
		expect(requestedPages).toContain("2");
	});

	it("requests the limit chosen in the pager", async () => {
		const user = userEvent.setup();
		const requestedLimits: Array<string | null> = [];

		server.use(
			http.get("*/records", ({ request }) => {
				requestedLimits.push(new URL(request.url).searchParams.get("limit"));

				return HttpResponse.json({
					data: [
						{
							id: recordId,
							date: "2024-03-01T12:00:00.000Z",
							kind: "expense",
							totalAmount: 123.45,
						},
					],
					pagination: {
						page: 1,
						totalPages: 1,
						hasNextPage: false,
						hasPreviousPage: false,
					},
				});
			}),
		);

		renderWithProviders(<RecordsTable />);

		await screen.findByText(formatPrice(123.45, "en"));

		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByRole("option", { name: "20" }));

		await waitFor(() => {
			expect(requestedLimits).toContain("20");
		});
	});
});
