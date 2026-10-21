import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { APP_ROUTES } from "@/app/routes";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { RecordPage } from "./index";

const recordId = "01JTZKQX2GT6PHGQER0M8FS6K8";

const useParamsMock = vi.hoisted(() => vi.fn(() => ({})));

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();

	return {
		...actual,
		useParams: () => useParamsMock(),
	};
});

describe("RecordPage", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		useParamsMock.mockReturnValue({ id: recordId });
	});

	it("renders nothing when record id is missing", () => {
		useParamsMock.mockReturnValue({});
		const { container } = renderWithProviders(<RecordPage />);

		expect(container).toBeEmptyDOMElement();
	});

	it("renders page copy, actions, and record content", async () => {
		renderWithProviders(<RecordPage />);

		expect(
			screen.getByText(t("single.title", { ns: "records" })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("single.description", { ns: "records" })),
		).toBeInTheDocument();

		const editLink = await screen.findByRole("link", {
			name: t("action.edit", { ns: "common" }),
		});

		expect(editLink).toHaveAttribute("href", APP_ROUTES.records.edit(recordId));
		expect(
			screen.getByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		).toBeInTheDocument();

		expect(await screen.findByText("Taxi")).toBeInTheDocument();
		expect(
			screen.getByText(t("common.total", { ns: "common" })),
		).toBeInTheDocument();
	});

	it("opens the delete dialog from the delete action", async () => {
		const user = userEvent.setup();
		renderWithProviders(<RecordPage />);

		await user.click(
			await screen.findByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		);

		expect(
			await screen.findByText(t("delete.expense.title", { ns: "records" })),
		).toBeInTheDocument();
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
	});

	it("shows an error when the record cannot be loaded", async () => {
		server.use(
			http.get(`*/records/${recordId}`, () =>
				HttpResponse.json({ error: { message: "Not Found" } }, { status: 404 }),
			),
		);

		renderWithProviders(<RecordPage />);

		await waitFor(() => {
			expect(
				screen.getByText(t("single.error.title", { ns: "records" })),
			).toBeInTheDocument();
		});
		expect(screen.queryByText("Taxi")).not.toBeInTheDocument();
	});
});
